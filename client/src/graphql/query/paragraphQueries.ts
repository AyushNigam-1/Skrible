import { gql } from "@apollo/client";

export const GET_PARAGRAPH_BY_ID = gql`
  query GetParagraphById($paragraphId: ID!) {
    getParagraphById(paragraphId: $paragraphId) {
      id
      script
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

export const EXPORT_DOCUMENT_QUERY = gql`
  query ExportDocument($scriptId: ID!, $format: String!) {
    exportDocument(scriptId: $scriptId, format: $format) {
      filename
      content
      contentType
    }
  }
`;
