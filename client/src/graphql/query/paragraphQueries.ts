import { gql } from "@apollo/client";

export const GET_PARAGRAPH_BY_ID = gql`
  query GetParagraphById($paragraphId: ID!) {
    getParagraphById(paragraphId: $paragraphId) {
      id
      script {
        id
        author {
          id
        }
        collaborators {
          role
          user {
            id
          }
        }
      }
      text
      status
      createdAt
      likes
      dislikes
      author {
        id
        username
      }
      comments {
        author {
          id
          username
        }
        text
        createdAt
      }
    }
  }
`;

export const GET_PENDING_PARAGRAPHS = gql`
  query GetPendingParagraphs($scriptId: ID!) {
    getPendingParagraphs(scriptId: $scriptId) {
      id
      text
      createdAt
      status
      author {
        username
      }
    }
  }
`;

export const EXPORT_DOCUMENT_QUERY = gql`
  query ExportDocument($scriptId: ID!, $format: String!) {
    exportDocument(scriptId: $scriptId, format: $format) {
      filename
      content
      contentType
    }
  }
`;
