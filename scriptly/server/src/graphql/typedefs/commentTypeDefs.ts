import { gql } from "graphql-tag";

export const commentTypeDefs = gql`
  type Comment {
    text: String!
    createdAt: String!
  }

  input CommentInput {
    text: String!
    createdAt: String!
  }
`;
