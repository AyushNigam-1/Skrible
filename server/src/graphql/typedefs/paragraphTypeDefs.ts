import { gql } from "graphql-tag";

export const paragraphTypeDefs = gql`

type Paragraph {
  id: ID!
  script: ID!
  author: Author!
  text: String!
  status: String!
  likes: Int!
  dislikes: Int!
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
  exportDocument(scriptId: ID!, format: String!): ExportedDocument!
}

`;
