import { gql } from "@apollo/client";

export const EDIT_PARAGRAPH = gql`
  mutation EditParagraph($paragraphId: ID!, $text: String!) {
    editParagraph(paragraphId: $paragraphId, text: $text) {
      id
      text
      createdAt
      author {
        id
        username
      }
    }
  }
`;

export const DELETE_PARAGRAPH = gql`
  mutation DeleteParagraph($paragraphId: ID!) {
    deleteParagraph(paragraphId: $paragraphId) {
      status
    }
  }
`;
