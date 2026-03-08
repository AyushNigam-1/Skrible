import { gql } from "graphql-tag";

export const paragraphTypeDefs = gql`
  type Paragraph {
    id: ID!
    script: Script!
    author: Author!
    text: String!
    status: String!
    likes: [ID!]!
    dislikes: [ID!]!
    comments: [Comment!]!
    createdAt: String!
  }

  type ExportedDocument {
    filename: String!
    content: String!
    contentType: String!
  }

  type Query {
    getParagraphById(paragraphId: ID!): Paragraph
    getCombinedText(scriptId: ID!): String!
    getPendingParagraphs(scriptId: ID!): [Paragraph!]!
    exportDocument(scriptId: ID!, format: String!): ExportedDocument!
  }

  type Mutation {
    editParagraph(paragraphId: ID!, text: String!): Paragraph!
    deleteParagraph(paragraphId: ID!): MutationResponse!
    likeParagraph(paragraphId: ID!): MutationResponse!
    dislikeParagraph(paragraphId: ID!): MutationResponse!
    addComment(paragraphId: ID!, text: String!): Paragraph!
  }
`;
