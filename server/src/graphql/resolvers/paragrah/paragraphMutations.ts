import Paragraph from "../../../models/Paragraph";
import Script from "../../../models/Script";
import { GraphQLError } from "graphql";

export const paragraphMutations = {
  editParagraph: async (
    _: any,
    { paragraphId, text }: { paragraphId: string; text: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

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

    return paragraph.populate("author");
  },

  deleteParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const paragraph = await Paragraph.findById(paragraphId).populate("script");
    if (!paragraph) throw new GraphQLError("Paragraph not found");

    const script: any = paragraph.script;
    const isParagraphAuthor = paragraph.author.toString() === userId;
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

    return { status: true };
  },

  // --- PARAGRAPH INTERACTIONS ---
  likeParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const paragraph = await Paragraph.findById(paragraphId);
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

    return { status: true };
  },

  dislikeParagraph: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    const paragraph = await Paragraph.findById(paragraphId);
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

    return { status: true };
  },

  addComment: async (
    _: any,
    { paragraphId, text }: { paragraphId: string; text: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

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

    return updatedParagraph;
  },
};
