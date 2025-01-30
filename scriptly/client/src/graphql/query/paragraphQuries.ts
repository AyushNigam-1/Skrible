import { gql } from "@apollo/client";

export const GET_PARAGRAPH_BY_ID = gql`
  query GetParagraphById($paragraphId: ID!) {
    getParagraphById(paragraphId: $paragraphId) {
      id
      text
      createdAt
      likes
      dislikes
      author {
        id
        username
      }
      comments
    }
  }
`;
