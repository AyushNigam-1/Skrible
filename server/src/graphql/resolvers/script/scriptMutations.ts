import mongoose from "mongoose";
import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";
import { GraphQLError } from "graphql";

const verifyOwner = async (scriptId: string, currentUserId: string) => {
  const script = await Script.findById(scriptId);
  if (!script) throw new GraphQLError("Script not found");

  if (script.author.toString() === currentUserId) return script;

  // TypeScript Bypass: Cast to any to access collaborators safely
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
    context: { user: { id: string } },
  ) => {
    if (!context.user?.id) {
      throw new GraphQLError("User not authenticated");
    }

    const script = await Script.create({
      author: new mongoose.Types.ObjectId(context.user.id),
      title,
      visibility,
      description,
      languages,
      genres,
      paragraphs: [],
      requests: [],
      combinedText: "",
    });

    await User.findByIdAndUpdate(context.user.id, {
      $push: { scripts: script._id },
    });

    return Script.findById(script._id).populate("author");
  },

  submitParagraph: async (
    _: any,
    { scriptId, text }: { scriptId: string; text: string },
    context: { user: { id: string } },
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

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
  ) => {
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

  rejectParagraph: async (_: any, { paragraphId }: { paragraphId: string }) => {
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

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favourites: scriptId },
    });

    return { status: true };
  },

  // --- SETTINGS: DELETE SCRIPT (SECURED) ---
  deleteScript: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("Auth required");

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    // SECURITY: Ensure only the original author can delete their script!
    if (script.author.toString() !== userId) {
      throw new GraphQLError("Not authorized to delete this script");
    }

    // Delete the script and all its associated paragraphs
    await Script.findByIdAndDelete(scriptId);
    await Paragraph.deleteMany({ script: scriptId });

    // CLEANUP: Remove the script reference from the user's array
    await User.findByIdAndUpdate(userId, {
      $pull: { scripts: scriptId },
    });

    return { status: true };
  },

  // --- SETTINGS: UPDATE SCRIPT ---
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

    const script = await Script.findById(scriptId);
    if (!script) throw new GraphQLError("Script not found");

    console.log(script.author.toString(), userId);
    if (script.author.toString() !== userId) {
      throw new GraphQLError("Not authorized to update this script");
    }

    if (title !== undefined) script.title = title;
    if (description !== undefined) script.description = description;
    if (visibility !== undefined) script.visibility = visibility;

    await script.save();
    return script.populate("author");
  },

  // --- SCRIPT (DRAFT) INTERACTIONS ---
  likeScript: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

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
