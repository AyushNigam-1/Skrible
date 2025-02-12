import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Author {
    id: ID!
    username: String!
    email: String!
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
    id: ID!
    title: String!
    visibility: String!
    description: String!
    languages: [String!]!
    genres: [String!]!
    paragraphs: [Paragraph!]!
    createdAt: String!
    requests: [Request!]!
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
  }

`;
