import { gql } from "graphql-tag";

export const paragraphTypeDefs = gql`
  type Paragraph {
    id: ID! 
    text: String!
    createdAt: String!
    likes: Int!
    dislikes: Int!
    author: Author!
    comments: [Comment]!
  }
  input ParagraphInput {
      text: String!

  }
  type Query{
    getParagraphById(paragraphId: ID!): Paragraph 
  }

`;
