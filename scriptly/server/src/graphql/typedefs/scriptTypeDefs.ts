import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Script {
    id: ID!
    title: String!
    visibility: String!
    description:String!
    language: String!
    genre: [String!]!
    paragraphs: [Paragraph!]!
  }

  type ScriptWithParagraph {
    scriptId: ID!
    title: String!
    paragraph: Paragraph!
  }


  input ParagraphInput {
    text: String!
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
        language: [String!]!,
        genre: [String!]!,
        description: String!,
        paragraphs: [ParagraphInput!]!
    ): Script!
}

`;
