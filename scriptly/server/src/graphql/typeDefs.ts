import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Comment {
    text: String!
    createdAt: String!
  }

  type Paragraph {
    text: String!
    createdAt: String!
    author: String!
    likes: Int!
    dislikes: Int!
    comments: [Comment!]!
  }

  type Script {
    id: ID!
    title: String!
    visibility: String!
    language: String!
    genre: [String!]!
    paragraphs: [Paragraph!]!
  }

  type Query {
    getAllScripts: [Script!]!
    getScriptById(id: ID!): Script
  }

  input CommentInput {
    text: String!
    createdAt: String!
  }

  input ParagraphInput {
    text: String!
    createdAt: String!
    author: String!
    likes: Int!
    dislikes: Int!
    comments: [CommentInput!]!
  }

  input CreateScriptInput {
    title: String!
    visibility: String!
    language: String!
    # genre: [String!]!
    # paragraphs: [ParagraphInput!]!
  }

  type Mutation {
  createScript(title: String!, visibility: String!, language: String!): Script!
}
`;
