import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Script {
    author:ID!
    id: ID!
    title: String!
    visibility: String!
    description:String!
    languages: [String!]!
    genres: [String!]!
    paragraphs: [Paragraph!]!
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
        paragraphs: [ParagraphInput!]!
    ): Script!
}

`;
