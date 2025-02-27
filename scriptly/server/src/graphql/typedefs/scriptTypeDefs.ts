import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Author {
    id: ID!
    username: String!
    email: String!
  }
  type MutationResponse {
    status: Boolean!
  }
  type Comment {
    text: String!
    createdAt: String!
  }

  type Request {
    author: Author!
    status: String!
    dislikes: Int!
    likes: Int!
    text:String!
    createdAt: String!
    comments: [Comment!]!
  }

  type Paragraph {
    text: String!
    createdAt: String!
    author: Author!
    likes: Int!
    dislikes: Int!
    comments: [Comment!]!
  }

  type Script {
    author: Author!
    _id: ID!
    title: String!
    visibility: String!
    description: String!
    languages: [String!]!
    genres: [String!]!
    paragraphs: [Paragraph!]!
    createdAt: String!
    updatedAt: String!
    requests: [Request!]!
    combinedText:String
  }

  type ScriptWithParagraph {
    scriptId: ID!
    title: String!
    paragraph: Paragraph!
  }

  type Query {
    getAllScripts: [Script!]!
    getScriptById(id: ID!): Script
    getParagraphWithParentScript(paragraphId: ID!): ScriptWithParagraph
    getScriptsByGenres(genres: [String!]!): [Script!]!
  }

  type Mutation {
    createScript(
      title: String!,
      visibility: String!,
      languages: [String!]!,
      genres: [String!]!,
      description: String!,
      paragraph: String!
    ): Script!
    markAsInterested(scriptId: ID!): MutationResponse
    markAsNotInterested(scriptId: ID!): MutationResponse
    markAsFavourite(scriptId: ID!): MutationResponse
    deleteScript(scriptId: ID!): MutationResponse
    
  }

`;
