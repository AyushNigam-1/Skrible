import { gql } from "graphql-tag";

export const paragraphTypeDefs = gql`
  type Paragraph {
    id: ID!
    content: String!
    createdAt: String!
    author: String!
    likes: Int!
    dislikes: Int!
    comments: [Comment!]!
  }

  input ParagraphInput {
    text: String!
    createdAt: String!
    author: String!
    likes: Int!
    dislikes: Int!
    comments: [CommentInput!]!
  }
`;
