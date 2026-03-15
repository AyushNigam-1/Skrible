import Paragraph from "../../../models/Paragraph";
import Script from "../../../models/Script";
import { GraphQLError } from "graphql";

const enforceRateLimit = async (
  redis: any,
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number,
) => {
  if (!redis) return;

  const key = `ratelimit:${action}:${identifier}`;
  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (currentCount > limit) {
    throw new GraphQLError(
      `Too many requests for ${action}. Please try again later.`,
      {
        extensions: { code: "TOO_MANY_REQUESTS", http: { status: 429 } },
      },
    );
  }
};

// 🚨 NEW: Centralized, versionless, robust cache clearing helper
const invalidateParagraphCache = async (
  redis: any,
  scriptId: string,
  paragraphId: string,
  authorId: string
) => {
  if (!redis) return;

  const keysToDelete = [
    `script:${scriptId}`,                                  // The main script timeline
    `paragraph:${paragraphId}`,                            // The specific paragraph preview
    `user:${authorId}:script:${scriptId}:contributions`,   // The author's specific drafts
    `script:${scriptId}:contributors`                      // The leaderboard/contributors list
  ];

  await redis.del(keysToDelete);
};

export const paragraphMutations = {
  editParagraph: async (
    _: any,
    { paragraphId, text }: { paragraphId: string; text: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "edit_paragraph", 30, 60);

    const paragraph = await Paragraph.findById(paragraphId);
    if (!paragraph) throw new GraphQLError("Paragraph not found");

    if (paragraph.author.toString() !== userId) {
      throw new GraphQLError("Not authorized to edit this paragraph");
    }

    if (!text || text.trim() === "") {
      throw new GraphQLError("Paragraph text cannot be empty");
    }

    paragraph.text = text;
    await paragraph.save();

    // Bust cache instantly
    await invalidateParagraphCache(
      context.redis,
      paragraph.script.toString(),
      paragraphId,
      paragraph.author.toString()
    );

    return paragraph.populate("author");
  },

  deleteParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "delete_paragraph", 20, 60);

    const paragraph = await Paragraph.findById(paragraphId).populate("script");
    if (!paragraph) throw new GraphQLError("Paragraph not found");

    const script: any = paragraph.script;
    const paragraphAuthorId = paragraph.author.toString();
    const isParagraphAuthor = paragraphAuthorId === userId;
    const isScriptOwner = script.author.toString() === userId;

    const isCollaboratorAdmin = script.collaborators?.some(
      (c: any) =>
        c.user.toString() === userId &&
        (c.role === "OWNER" || c.role === "EDITOR"),
    );

    if (!isParagraphAuthor && !isScriptOwner && !isCollaboratorAdmin) {
      throw new GraphQLError("Not authorized to delete this paragraph");
    }

    await Paragraph.findByIdAndDelete(paragraphId);
    await Script.findByIdAndUpdate(script._id, {
      $pull: { paragraphs: paragraphId },
    });

    // Bust cache instantly
    await invalidateParagraphCache(
      context.redis,
      script._id.toString(),
      paragraphId,
      paragraphAuthorId
    );

    return { status: true };
  },

  likeParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "like_paragraph", 60, 60);

    const paragraph = await Paragraph.findById(paragraphId).select("script author likes");
    if (!paragraph) throw new GraphQLError("Paragraph not found");

    const hasLiked = paragraph.likes?.includes(userId) || false;

    if (hasLiked) {
      await Paragraph.findByIdAndUpdate(paragraphId, {
        $pull: { likes: userId },
      });
    } else {
      await Paragraph.findByIdAndUpdate(paragraphId, {
        $addToSet: { likes: userId },
        $pull: { dislikes: userId },
      });
    }

    // Bust cache instantly
    await invalidateParagraphCache(
      context.redis,
      paragraph.script.toString(),
      paragraphId,
      paragraph.author.toString()
    );

    return { status: true };
  },

  dislikeParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "dislike_paragraph", 60, 60);

    // We fetch script and author here so we can invalidate the cache later
    const paragraph = await Paragraph.findById(paragraphId).select("script author dislikes");
    if (!paragraph) throw new GraphQLError("Paragraph not found");

    const hasDisliked = paragraph.dislikes?.includes(userId) || false;

    if (hasDisliked) {
      await Paragraph.findByIdAndUpdate(paragraphId, {
        $pull: { dislikes: userId },
      });
    } else {
      await Paragraph.findByIdAndUpdate(paragraphId, {
        $addToSet: { dislikes: userId },
        $pull: { likes: userId },
      });
    }

    // Bust cache instantly
    await invalidateParagraphCache(
      context.redis,
      paragraph.script.toString(),
      paragraphId,
      paragraph.author.toString()
    );

    return { status: true };
  },

  addComment: async (
    _: any,
    { paragraphId, text }: { paragraphId: string; text: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "add_comment", 30, 60);

    if (!text || text.trim() === "") {
      throw new GraphQLError("Comment cannot be empty");
    }

    const updatedParagraph = await Paragraph.findByIdAndUpdate(
      paragraphId,
      {
        $push: {
          comments: {
            author: userId,
            text: text,
          },
        },
      },
      { new: true },
    ).populate("comments.author");

    if (!updatedParagraph) throw new GraphQLError("Paragraph not found");

    await invalidateParagraphCache(
      context.redis,
      updatedParagraph.script.toString(),
      paragraphId,
      updatedParagraph.author.toString()
    );

    return updatedParagraph;
  },
};