import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  # --- NEW: Defined the Roles ---
  enum Role {
    OWNER
    EDITOR
    CONTRIBUTOR
    VIEWER
  }

  type Author {
    id: ID!
    username: String!
    email: String
  }

  # --- NEW: Collaborator Type ---
  type Collaborator {
    user: Author! # Reusing your existing Author type for user details
    role: Role!
    addedAt: String
  }

  type Comment {
    text: String!
    createdAt: String!
    # ADDED: Author field so the frontend can display who wrote the comment
    author: Author!
  }

  type Paragraph {
    id: ID!
    text: String!
    createdAt: String!
    author: Author!
    likes: [ID!]!
    dislikes: [ID!]!
    comments: [Comment!]!
  }

  type Script {
    id: ID!
    author: Author!
    title: String!
    visibility: String!
    description: String!
    languages: [String!]!
    genres: [String!]!
    paragraphs: [Paragraph!]!
    likes: [ID!]!
    dislikes: [ID!]!
    createdAt: String!
    updatedAt: String!
    combinedText: String
    # --- NEW: Added collaborators array ---
    collaborators: [Collaborator!]
  }

  type MutationResponse {
    status: Boolean!
  }

  type ScriptContributors {
    contributors: [Contributor!]!
  }

  type Contributor {
    userId: ID!
    details: ContributorDetails!
  }

  type ContributorDetails {
    name: String!
    paragraphs: [Paragraph!]!
  }

  type ExportedDocument {
    filename: String!
    content: String!
    contentType: String!
  }

  type Query {
    getAllScripts: [Script!]!
    getScriptById(id: ID!): Script
    getScriptsByGenres(genres: [String!]!): [Script!]!
    getScriptContributors(scriptId: ID!): ScriptContributors!
    getParagraphById(paragraphId: ID!): Paragraph
    getCombinedText(scriptId: ID!): String!
    exportDocument(scriptId: ID!, format: String!): ExportedDocument!
  }

  type Mutation {
    createScript(
      title: String!
      visibility: String!
      languages: [String!]!
      genres: [String!]!
      description: String!
    ): Script!
    updateScript(
      scriptId: ID!
      title: String
      description: String
      visibility: String
    ): Script!
    submitParagraph(scriptId: ID!, text: String!): Paragraph!
    approveParagraph(paragraphId: ID!): MutationResponse!
    rejectParagraph(paragraphId: ID!): MutationResponse!
    markAsInterested(scriptId: ID!): MutationResponse!
    markAsNotInterested(scriptId: ID!): MutationResponse!
    markAsFavourite(scriptId: ID!): MutationResponse!
    deleteScript(scriptId: ID!): MutationResponse!
    likeParagraph(paragraphId: ID!): MutationResponse!
    dislikeParagraph(paragraphId: ID!): MutationResponse!
    addComment(paragraphId: ID!, text: String!): Paragraph!
    likeScript(scriptId: ID!): MutationResponse!
    dislikeScript(scriptId: ID!): MutationResponse!

    # --- NEW: Role Management Mutations ---
    addCollaborator(scriptId: ID!, username: String!, role: Role!): Script!
    removeCollaborator(scriptId: ID!, targetUserId: ID!): Script!
    updateCollaboratorRole(
      scriptId: ID!
      targetUserId: ID!
      role: Role!
    ): Script!
  }
`;
