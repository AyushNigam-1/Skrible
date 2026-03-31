import mongoose from "mongoose";
import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";
import Notification from "../../../models/Notification";
import { getIO } from "../../../utils/socket";
import { GraphQLError } from "graphql";

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

const invalidateScriptCache = async (redis: any, scriptId: string) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(`*${scriptId}*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error("Redis cache clearing failed:", error);
  }
};

const verifyEditorOrOwner = async (scriptId: string, currentUserId: string) => {
  const script = await Script.findById(scriptId);
  if (!script) throw new GraphQLError("Script not found");

  if (script.author.toString() === currentUserId) return script;

  const scriptDoc = script as any;
  const collab = scriptDoc.collaborators?.find(
    (c: any) => c.user.toString() === currentUserId,
  );

  if (collab && (collab.role === "EDITOR" || collab.role === "OWNER")) return script;

  throw new GraphQLError("Access Denied: Only Authors and Editors can perform this action.");
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

    if (visibility === "Public") {
      try {
        const exploreCacheKeys = await context.redis.keys("scripts:genres:public:*");
        if (exploreCacheKeys.length > 0) {
          await context.redis.del(exploreCacheKeys);
        }
      } catch (err) {
        console.error("Failed to clear explore cache:", err);
      }
    }

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

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    const paragraph = await Paragraph.create({
      script: scriptId,
      author: userId,
      text,
      status: "pending",
    });

    const firstName = getFirstName(context.user?.name);
    const draftTitle = getCleanTitle(script);

    await dispatchNotification(
      script.author,
      userId,
      "INFO",
      `${firstName} submitted a contribution`,
      `/contribution/${scriptId}/${paragraph._id}`,
      draftTitle
    );

    await invalidateScriptCache(context.redis, scriptId);

    const userCacheKey = `user:${userId}:contributions:v3`;
    await context.redis.del(userCacheKey);

    return paragraph.populate("author");
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

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");

    if (!user.favourites) {
      user.favourites = [];
    }

    const hasFavourited = user.favourites.some(
      (id: any) => id.toString() === scriptId.toString()
    );

    if (hasFavourited) {
      user.favourites = user.favourites.filter(
        (id: any) => id.toString() !== scriptId.toString()
      );
    } else {
      const objectId = new mongoose.Types.ObjectId(scriptId);
      user.favourites.push(objectId as any);
    }

    await user.save();

    await context.redis.del(`user:${userId}`);

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

    const wasPublic = script.visibility === "Public";

    await Script.findByIdAndDelete(scriptId);
    await Paragraph.deleteMany({ script: scriptId });

    await User.findByIdAndUpdate(userId, {
      $pull: { scripts: scriptId },
    });

    await invalidateScriptCache(context.redis, scriptId);

    await context.redis.del(`user:${userId}:scripts:owner:v3`);
    await context.redis.del(`user:${userId}:scripts:public:v3`);

    if (wasPublic) {
      try {
        const exploreCacheKeys = await context.redis.keys("scripts:genres:public:*");
        if (exploreCacheKeys.length > 0) {
          await Promise.all(exploreCacheKeys.map((key: string) => context.redis.del(key)));
        }
      } catch (err) {
        console.error("❌ Failed to clear explore cache:", err);
      }
    }

    return { status: true };
  },
  removeAllParagraphs: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    if (script.author.toString() !== userId) {
      throw new GraphQLError("Only the author can clear the script");
    }

    // Wipe all paragraphs
    script.paragraphs = [];
    await script.save();

    await invalidateScriptCache(context.redis, scriptId);
    return script;
  },

  removeAllCollaborators: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    if (script.author.toString() !== userId) {
      throw new GraphQLError("Only the author can remove all members");
    }

    script.collaborators = [];
    await script.save();

    await invalidateScriptCache(context.redis, scriptId);
    return script;
  },
  updateScript: async (
    _: any,
    {
      scriptId,
      title,
      description,
      visibility,
      genres, // 🚨 ADDED
      languages, // 🚨 ADDED
    }: {
      scriptId: string;
      title?: string;
      description?: string;
      visibility?: string;
      genres?: string[]; // 🚨 ADDED
      languages?: string[]; // 🚨 ADDED
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

    const wasPublic = script.visibility === "Public";

    if (title !== undefined && title !== null) script.title = title;
    if (description !== undefined && description !== null) script.description = description;
    if (visibility !== undefined && visibility !== null) script.visibility = visibility;

    if (genres !== undefined && genres !== null) script.genres = genres;
    if (languages !== undefined && languages !== null) script.languages = languages;

    const isNowPublic = script.visibility === "Public";

    await script.save();

    await invalidateScriptCache(context.redis, scriptId);

    await context.redis.del(`user:${userId}:scripts:owner:v3`);
    await context.redis.del(`user:${userId}:scripts:public:v3`);

    if (wasPublic || isNowPublic) {
      try {
        const exploreCacheKeys = await context.redis.keys("scripts:genres:public:*");
        if (exploreCacheKeys.length > 0) {
          await Promise.all(exploreCacheKeys.map((key: string) => context.redis.del(key)));
        }
      } catch (err) {
        console.error("❌ Failed to clear explore cache:", err);
      }
    }

    const decryptedScript = await Script.findById(scriptId).populate("author");

    return decryptedScript;
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

      const firstName = getFirstName(context.user?.name);
      const draftTitle = getCleanTitle(script);

      await dispatchNotification(
        script.author,
        userId,
        "LIKE",
        `${firstName} liked your draft`,
        `/script/${scriptId}`,
        draftTitle
      );
    }

    await invalidateScriptCache(context.redis, scriptId);

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

    await invalidateScriptCache(context.redis, scriptId);

    return { status: true };
  },
  addCollaborator: async (
    _: any,
    {
      scriptId,
      identifier,
      role,
    }: { scriptId: string; identifier: string; role: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    await enforceRateLimit(context.redis, userId, "manage_collab", 30, 60);

    // 🚨 UPDATED: Uses the new helper so Editors can invite people
    const script = await verifyEditorOrOwner(scriptId, userId);

    const targetUser = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!targetUser) throw new GraphQLError(`User '${identifier}' not found on Skrible.`);

    const targetUserId = (targetUser as any)._id;
    const userName = context.user?.name;
    const scriptDoc = script as any;
    const alreadyExists = scriptDoc.collaborators?.some(
      (c: any) => c.user.toString() === targetUserId.toString(),
    );
    if (alreadyExists) throw new GraphQLError("User is already a collaborator or has a pending invite.");

    const updatedScript = await Script.findByIdAndUpdate(
      scriptId,
      {
        $push: {
          collaborators: {
            user: targetUserId,
            role: role,
            status: "PENDING"
          },
        },
      },
      { new: true },
    )
      .populate("author")
      .populate("collaborators.user");

    await dispatchNotification(
      targetUserId,
      userId,
      "REQUEST",
      `${userName} invited you to collaborate on a draft.`,
      `/timeline/${scriptId}`
    );

    await invalidateScriptCache(context.redis, scriptId);

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

    let script;

    // 🚨 THE FIX: If they are removing themselves (Self-Removal), bypass the Editor check!
    if (userId === targetUserId) {
      script = await Script.findById(scriptId);
      if (!script) throw new GraphQLError("Script not found");
    } else {
      // If removing someone else, they MUST be an Author or Editor
      script = await verifyEditorOrOwner(scriptId, userId);
    }

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

    await invalidateScriptCache(context.redis, scriptId);

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

    // 🚨 UPDATED: Uses the new helper so Editors can change roles
    const script = await verifyEditorOrOwner(scriptId, userId);

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

    await invalidateScriptCache(context.redis, scriptId);

    return updatedScript;
  },

  acceptInvitation: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const updatedScript = await Script.findOneAndUpdate(
      { _id: scriptId, "collaborators.user": userId, "collaborators.status": "PENDING" },
      {
        $set: { "collaborators.$.status": "ACCEPTED" },
      },
      { new: true },
    ).populate("author").populate("collaborators.user");

    if (!updatedScript) {
      throw new GraphQLError("Invitation not found or already accepted.");
    }

    // 🚨 NOTIFICATION: Let the script owner know they accepted!
    await dispatchNotification(
      updatedScript.author,
      userId,
      "INFO",
      `{name} accepted your invitation to collaborate.`,
      `/script/${scriptId}`
    );

    await invalidateScriptCache(context.redis, scriptId);
    return updatedScript;
  },

  declineInvitation: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const updatedScript = await Script.findByIdAndUpdate(
      scriptId,
      {
        $pull: { collaborators: { user: userId, status: "PENDING" } },
      },
      { new: true },
    ).populate("author").populate("collaborators.user");

    if (!updatedScript) {
      throw new GraphQLError("Invitation not found.");
    }

    await invalidateScriptCache(context.redis, scriptId);
    return updatedScript;
  },
};