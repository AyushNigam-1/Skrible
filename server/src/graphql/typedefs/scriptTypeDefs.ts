import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Author {
    id: ID!
    username: String!
    email: String
  }

  type Comment {
    text: String!
    createdAt: String!
  }

  type Paragraph {
    id: ID!
    text: String!
    createdAt: String!
    author: Author!
    likes: Int!
    dislikes: Int!
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
    createdAt: String!
    updatedAt: String!
    combinedText: String
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

    submitParagraph(scriptId: ID!, text: String!): Paragraph!
    approveParagraph(paragraphId: ID!): MutationResponse!
    rejectParagraph(paragraphId: ID!): MutationResponse!
    markAsInterested(scriptId: ID!): MutationResponse!
    markAsNotInterested(scriptId: ID!): MutationResponse!
    markAsFavourite(scriptId: ID!): MutationResponse!
    deleteScript(scriptId: ID!): MutationResponse!
  }
`;
