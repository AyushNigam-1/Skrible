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
  link: string,
  draftTitle?: string
) => {
  const recipientStr = recipientId.toString();
  if (recipientStr === senderId.toString()) return;

  Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    message,
    draftTitle,
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

      getIO().to(recipientStr).emit("new notification", payload);
    })
    .catch(console.error);
};

const getCleanTitle = (scriptDoc: any) => {
  if (!scriptDoc) return "Untitled Draft";
  try {
    const obj = scriptDoc.toObject({ virtuals: true });
    return obj.title || "Untitled Draft";
  } catch (err) {
    return scriptDoc.title || "Untitled Draft";
  }
};

const getFirstName = (fullName: string | undefined) => {
  if (!fullName) return "Someone";
  return fullName.split(" ")[0];
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

    const existingCollab = script.collaborators?.find(
      (c: any) => c.user.toString() === paragraphAuthorId,
    );

    // 🚨 THE FIX: Explicitly handle ACCEPTED status and existing pending users
    if (existingCollab) {
      // If they are already in the array (e.g., as PENDING), force them to ACCEPTED
      await Script.findOneAndUpdate(
        { _id: paragraph.script, "collaborators.user": paragraph.author },
        {
          $addToSet: { paragraphs: paragraph._id },
          $set: { "collaborators.$.status": "ACCEPTED" },
        }
      );
    } else if (paragraphAuthorId !== scriptOwnerId) {
      // If they are completely new, push them and EXPLICITLY set status to ACCEPTED
      await Script.findByIdAndUpdate(paragraph.script, {
        $addToSet: { paragraphs: paragraph._id },
        $push: {
          collaborators: {
            user: paragraph.author,
            role: "CONTRIBUTOR",
            status: "ACCEPTED", // <-- Fixed default pending bug
          },
        },
      });
    } else {
      // It's the owner's own paragraph, just link the paragraph ID
      await Script.findByIdAndUpdate(paragraph.script, {
        $addToSet: { paragraphs: paragraph._id },
      });
    }

    await invalidateParagraphCache(context.redis, paragraph.script.toString(), paragraphId);

    // 🚨 CACHE FIX: Force clear the script-level cache so the frontend collaborator list updates instantly
    if (context.redis) {
      try {
        const exactScriptKeys = await context.redis.keys(`*${paragraph.script.toString()}*`);
        if (exactScriptKeys.length > 0) {
          await context.redis.del(exactScriptKeys);
        }
      } catch (err) {
        console.error("Script cache clear failed:", err);
      }
    }

    const firstName = getFirstName(context.user?.name);
    const draftTitle = getCleanTitle(script);

    await dispatchNotification(
      paragraph.author,
      userId,
      "INFO",
      `${firstName} approved your contribution`,
      `/contribution/${script._id}/${paragraph._id}`,
      draftTitle
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

    const paragraph: any = await Paragraph.findByIdAndUpdate(paragraphId, { status: "rejected" }).populate("script");

    if (paragraph) {
      await invalidateParagraphCache(context.redis, paragraph.script._id.toString(), paragraphId);

      const firstName = getFirstName(context.user?.name);
      const draftTitle = getCleanTitle(paragraph.script);

      // 🚨 THE FIX: Direct contribution link
      await dispatchNotification(
        paragraph.author,
        userId,
        "INFO",
        `${firstName} declined your submission`,
        `/contribution/${paragraph.script._id}/${paragraph._id}`,
        draftTitle
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

    // 🚨 THE FIX: Populate the script so we can check owner and editor permissions
    const paragraph = await Paragraph.findById(paragraphId).populate("script");
    if (!paragraph) throw new GraphQLError("Paragraph not found");

    const script: any = paragraph.script;
    const paragraphAuthorId = paragraph.author.toString();

    // Permission Checks
    const isParagraphAuthor = paragraphAuthorId === userId;
    const isScriptOwner = script.author.toString() === userId;
    const isEditor = script.collaborators?.some(
      (c: any) =>
        c.user.toString() === userId &&
        (c.role === "EDITOR" || c.role === "OWNER")
    );

    // 🚨 THE FIX: Allow Author, Owner, OR Editor to make edits
    if (!isParagraphAuthor && !isScriptOwner && !isEditor) {
      throw new GraphQLError("Not authorized to edit this paragraph");
    }

    if (!text || text.trim() === "") {
      throw new GraphQLError("Paragraph text cannot be empty");
    }

    paragraph.text = text;
    await paragraph.save();

    // Invalidate cache using the script ID
    await invalidateParagraphCache(context.redis, script._id.toString(), paragraphId);

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

    // Permission Checks
    const isParagraphAuthor = paragraphAuthorId === userId;
    const isScriptOwner = script.author?.toString() === userId;

    // 🚨 BULLETPROOF CHECK: Safely optional-chain the user ID to prevent server crashes
    const isEditor = script.collaborators?.some(
      (c: any) =>
        c.user?.toString() === userId &&
        (c.role === "OWNER" || c.role === "EDITOR")
    );

    if (!isParagraphAuthor && !isScriptOwner && !isEditor) {
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

    const paragraph: any = await Paragraph.findById(paragraphId).select("script author likes dislikes").populate("script");
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

      const firstName = getFirstName(context.user?.name);
      const draftTitle = getCleanTitle(paragraph.script);

      // 🚨 THE FIX: Direct contribution link
      await dispatchNotification(
        paragraph.author,
        userId,
        "LIKE",
        `${firstName} liked your contribution`,
        `/contribution/${paragraph.script._id}/${paragraph._id}`,
        draftTitle
      );
    }

    await invalidateParagraphCache(context.redis, paragraph.script._id.toString(), paragraphId);
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

    const updatedParagraph: any = await Paragraph.findByIdAndUpdate(
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
    ).populate("comments.author").populate("script");

    if (!updatedParagraph) throw new GraphQLError("Paragraph not found");

    await invalidateParagraphCache(context.redis, updatedParagraph.script._id.toString(), paragraphId);

    const firstName = getFirstName(context.user?.name);
    const draftTitle = getCleanTitle(updatedParagraph.script);

    // 🚨 THE FIX: Direct contribution link
    await dispatchNotification(
      updatedParagraph.author,
      userId,
      "COMMENT",
      `${firstName} commented on your contribution`,
      `/contribution/${updatedParagraph.script._id}/${updatedParagraph._id}`,
      draftTitle
    );

    return updatedParagraph;
  },
};