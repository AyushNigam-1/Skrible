import Paragraph from "../../../models/Paragraph";
import Script from "../../../models/Script";
import Notification from "../../../models/Notification";
import { GraphQLError } from "graphql";
import { getIO } from "../../../utils/socket";

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

const invalidateParagraphCache = async (
  redis: any,
  scriptId: string,
  paragraphId: string
) => {
  if (!redis) return;
  try {
    const scriptKeys = await redis.keys(`*${scriptId}*`);
    const paragraphKeys = await redis.keys(`*${paragraphId}*`);
    const keysToDelete = [...new Set([...scriptKeys, ...paragraphKeys])];

    if (keysToDelete.length > 0) {
      await redis.del(keysToDelete);
    }
  } catch (err) {
    console.error("Redis cache clearing failed", err);
  }
};

const dispatchNotification = (
  recipientId: any,
  senderId: any,
  type: string,
  message: string,
  link: string
) => {
  const recipientStr = recipientId.toString();
  if (recipientStr === senderId.toString()) return;

  Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    message,
    link,
  })
    .then(async (newNotif: any) => {
      const populatedNotif = await newNotif.populate("sender", "id name");
      const obj = populatedNotif.toObject({ virtuals: true });

      const payload = {
        ...obj,
        id: obj.id || newNotif._id.toString(),
        createdAt: newNotif.createdAt.getTime().toString(),
      };

      console.log(`🚀 Sending Socket.io Ping to room: ${recipientStr}`);
      getIO().to(recipientStr).emit("new notification", payload);
    })
    .catch(console.error);
};

export const paragraphMutations = {
  approveParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "approve_paragraph", 60, 60);

    const paragraph = await Paragraph.findByIdAndUpdate(
      paragraphId,
      { status: "approved" },
      { new: true },
    );

    if (!paragraph) throw new GraphQLError("Paragraph not found");

    const script = await Script.findById(paragraph.script);
    if (!script) throw new GraphQLError("Script not found");

    const paragraphAuthorId = paragraph.author.toString();
    const scriptOwnerId = script.author.toString();

    const isAlreadyCollaborator = script.collaborators?.some(
      (c: any) => c.user.toString() === paragraphAuthorId,
    );

    const updateQuery: any = {
      $addToSet: { paragraphs: paragraph._id },
    };

    if (!isAlreadyCollaborator && paragraphAuthorId !== scriptOwnerId) {
      updateQuery.$push = {
        collaborators: {
          user: paragraph.author,
          role: "CONTRIBUTOR",
        },
      };
    }

    await Script.findByIdAndUpdate(paragraph.script, updateQuery);
    await invalidateParagraphCache(context.redis, paragraph.script.toString(), paragraphId);

    // 🚨 NOTIFICATION
    const userName = context.user?.name || "Someone";
    await dispatchNotification(
      paragraph.author,
      userId,
      "REQUEST",
      `${userName} approved and merged your contribution!`,
      `/script/${paragraph.script}`
    );

    return { status: true };
  },

  rejectParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "reject_paragraph", 60, 60);

    const paragraph = await Paragraph.findByIdAndUpdate(paragraphId, { status: "rejected" });

    if (paragraph) {
      await invalidateParagraphCache(context.redis, paragraph.script.toString(), paragraphId);

      // 🚨 NOTIFICATION
      const userName = context.user?.name || "Someone";
      await dispatchNotification(
        paragraph.author,
        userId,
        "INFO",
        `${userName} declined your paragraph submission.`,
        `/script/${paragraph.script}`
      );
    }

    return { status: true };
  },

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
    await invalidateParagraphCache(context.redis, paragraph.script.toString(), paragraphId);

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

    await invalidateParagraphCache(context.redis, script._id.toString(), paragraphId);

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

    const paragraph = await Paragraph.findById(paragraphId).select("script author likes dislikes");
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

      // 🚨 NOTIFICATION
      const userName = context.user?.name || "Someone";
      await dispatchNotification(
        paragraph.author,
        userId,
        "LIKE",
        `${userName} liked your contribution.`,
        `/script/${paragraph.script}`
      );
    }

    await invalidateParagraphCache(context.redis, paragraph.script.toString(), paragraphId);
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

    await invalidateParagraphCache(context.redis, paragraph.script.toString(), paragraphId);

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

    await invalidateParagraphCache(context.redis, updatedParagraph.script.toString(), paragraphId);

    // 🚨 NOTIFICATION
    const userName = context.user?.name || "Someone";
    await dispatchNotification(
      updatedParagraph.author,
      userId,
      "COMMENT",
      `${userName} commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      `/script/${updatedParagraph.script}`
    );

    return updatedParagraph;
  },
};