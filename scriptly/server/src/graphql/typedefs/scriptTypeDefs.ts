import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Script {
    id: ID!
    title: String!
    visibility: String!
    language: String!
    genre: [String!]!
    paragraphs: [Paragraph!]!
  }

  type ScriptWithParagraph {
    scriptId: ID!
    title: String!
    paragraph: Paragraph!
  }

  input CreateScriptInput {
    title: String!
    visibility: String!
    language: String!
  }

  type Query {
    getAllScripts: [Script!]!
    getScriptById(id: ID!): Script
    getParagraphWithParentScript(paragraphId: ID!): ScriptWithParagraph
  }

  type Mutation {
    createScript(title: String!, visibility: String!, language: String!): Script!
  }
`;
