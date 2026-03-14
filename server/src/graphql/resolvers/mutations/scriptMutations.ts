import mongoose from "mongoose";
import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";
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

const verifyOwner = async (scriptId: string, currentUserId: string) => {
  const script = await Script.findById(scriptId);
  if (!script) throw new GraphQLError("Script not found");

  if (script.author.toString() === currentUserId) return script;

  const scriptDoc = script as any;
  const collab = scriptDoc.collaborators?.find(
    (c: any) => c.user.toString() === currentUserId,
  );

  if (collab && collab.role === "OWNER") return script;

  throw new GraphQLError("Access Denied: Only Owners can manage roles.");
};

export const scriptMutations = {
  createScript: async (
    _: any,
    {
      title,
      visibility,
      description,
      languages,
      genres,
    }: {
      title: string;
      visibility: string;
      languages: string[];
      genres: string[];
      description: string;
    },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError("User not authenticated");
    }

    await enforceRateLimit(context.redis, userId, "create_script", 10, 3600);

    const script = await Script.create({
      author: new mongoose.Types.ObjectId(userId),
      title,
      visibility,
      description,
      languages,
      genres,
      paragraphs: [],
      requests: [],
      combinedText: "",
    });

    await User.findByIdAndUpdate(userId, {
      $push: { scripts: script._id },
    });

    await context.redis.del(`user:${userId}:scripts:owner:v3`);
    await context.redis.del(`user:${userId}:scripts:public:v3`);

    return Script.findById(script._id).populate("author");
  },

  submitParagraph: async (
    _: any,
    { scriptId, text }: { scriptId: string; text: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "submit_paragraph", 30, 3600);

    const paragraph = await Paragraph.create({
      script: scriptId,
      author: userId,
      text,
      status: "pending",
    });

    return paragraph.populate("author");
  },

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

    await Paragraph.findByIdAndUpdate(paragraphId, { status: "rejected" });
    return { status: true };
  },

  markAsInterested: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("Auth required");

    await enforceRateLimit(context.redis, userId, "mark_interested", 60, 60);

    await User.findByIdAndUpdate(userId, {
      $addToSet: { interested: scriptId },
      $pull: { notInterested: scriptId },
    });

    return { status: true };
  },

  markAsNotInterested: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("Auth required");

    await enforceRateLimit(
      context.redis,
      userId,
      "mark_not_interested",
      60,
      60,
    );

    await User.findByIdAndUpdate(userId, {
      $addToSet: { notInterested: scriptId },
      $pull: { interested: scriptId },
    });

    return { status: true };
  },

  markAsFavourite: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("Auth required");

    await enforceRateLimit(context.redis, userId, "mark_favourite", 60, 60);

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favourites: scriptId },
    });

    return { status: true };
  },

  deleteScript: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("Auth required");

    await enforceRateLimit(context.redis, userId, "delete_script", 20, 60);

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    if (script.author.toString() !== userId) {
      throw new GraphQLError("Not authorized to delete this script");
    }

    await Script.findByIdAndDelete(scriptId);
    await Paragraph.deleteMany({ script: scriptId });

    await User.findByIdAndUpdate(userId, {
      $pull: { scripts: scriptId },
    });

    return { status: true };
  },

  updateScript: async (
    _: any,
    {
      scriptId,
      title,
      description,
      visibility,
    }: {
      scriptId: string;
      title?: string;
      description?: string;
      visibility?: string;
    },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "update_script", 30, 60);

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    if (script.author.toString() !== userId) {
      throw new GraphQLError("Not authorized to update this script");
    }

    if (title !== undefined) script.title = title;
    if (description !== undefined) script.description = description;
    if (visibility !== undefined) script.visibility = visibility;

    await script.save();
    return script.populate("author");
  },

  likeScript: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "like_script", 60, 60);

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    const hasLiked = script.likes?.includes(userId) || false;

    if (hasLiked) {
      await Script.findByIdAndUpdate(scriptId, {
        $pull: { likes: userId },
      });
    } else {
      await Script.findByIdAndUpdate(scriptId, {
        $addToSet: { likes: userId },
        $pull: { dislikes: userId },
      });
    }

    return { status: true };
  },

  dislikeScript: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "dislike_script", 60, 60);

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    const hasDisliked = script.dislikes?.includes(userId) || false;

    if (hasDisliked) {
      await Script.findByIdAndUpdate(scriptId, {
        $pull: { dislikes: userId },
      });
    } else {
      await Script.findByIdAndUpdate(scriptId, {
        $addToSet: { dislikes: userId },
        $pull: { likes: userId },
      });
    }

    return { status: true };
  },

  addCollaborator: async (
    _: any,
    {
      scriptId,
      username,
      role,
    }: { scriptId: string; username: string; role: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "manage_collab", 30, 60);

    const script = await verifyOwner(scriptId, userId);

    const targetUser = await User.findOne({ username });
    if (!targetUser) throw new GraphQLError(`User @${username} not found`);

    const targetUserId = (targetUser as any)._id;

    const scriptDoc = script as any;
    const alreadyExists = scriptDoc.collaborators?.some(
      (c: any) => c.user.toString() === targetUserId.toString(),
    );
    if (alreadyExists) throw new GraphQLError("User is already a collaborator");

    const updatedScript = await Script.findByIdAndUpdate(
      scriptId,
      {
        $push: {
          collaborators: {
            user: targetUserId,
            role: role,
          },
        },
      },
      { new: true },
    )
      .populate("author")
      .populate("collaborators.user");

    return updatedScript;
  },

  removeCollaborator: async (
    _: any,
    { scriptId, targetUserId }: { scriptId: string; targetUserId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "manage_collab", 30, 60);

    const script = await verifyOwner(scriptId, userId);

    if (script.author.toString() === targetUserId) {
      throw new GraphQLError(
        "Cannot remove the original author from the manuscript.",
      );
    }

    const updatedScript = await Script.findByIdAndUpdate(
      scriptId,
      {
        $pull: {
          collaborators: { user: targetUserId },
        },
      },
      { new: true },
    )
      .populate("author")
      .populate("collaborators.user");

    return updatedScript;
  },

  updateCollaboratorRole: async (
    _: any,
    {
      scriptId,
      targetUserId,
      role,
    }: { scriptId: string; targetUserId: string; role: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "manage_collab", 30, 60);

    const script = await verifyOwner(scriptId, userId);

    if (script.author.toString() === targetUserId) {
      throw new GraphQLError("Cannot change the role of the original author.");
    }

    const updatedScript = await Script.findOneAndUpdate(
      { _id: scriptId, "collaborators.user": targetUserId },
      {
        $set: { "collaborators.$.role": role },
      },
      { new: true },
    )
      .populate("author")
      .populate("collaborators.user");

    if (!updatedScript)
      throw new GraphQLError("Collaborator not found on this script");

    return updatedScript;
  },
};
