import { gql } from "@apollo/client";

export const ADD_SCRIPT = gql`
mutation CreateScript(
  $title: String!
  $visibility: String!
  $languages: [String!]!
  $genres: [String!]!
  $description: String!
) {
  createScript(
    title: $title
    visibility: $visibility
    languages: $languages
    genres: $genres
    description: $description
  ) {
    id
    title
    visibility
    languages
    genres
    description
    author {
      username
    }
  }
}
`;

export const SUBMIT_PARAGRAPH = gql`
mutation SubmitParagraph($scriptId: ID!, $text: String!) {
  submitParagraph(scriptId: $scriptId, text: $text) {
    id
    status
    text
    createdAt
  }
}
`;

export const APPROVE_PARAGRAPH = gql`
mutation ApproveParagraph($paragraphId: ID!) {
  approveParagraph(paragraphId: $paragraphId) {
    status
  }
}
`;

export const REJECT_PARAGRAPH = gql`
mutation RejectParagraph($paragraphId: ID!) {
  rejectParagraph(paragraphId: $paragraphId) {
    status
  }
}
`;

export const LIKE_PARAGRAPH = gql`
mutation LikeParagraph($paragraphId: ID!) {
  likeParagraph(paragraphId: $paragraphId) {
    status
  }
}
`;

export const DISLIKE_PARAGRAPH = gql`
mutation DislikeParagraph($paragraphId: ID!) {
  dislikeParagraph(paragraphId: $paragraphId) {
    status
  }
}
`;

export const DELETE_SCRIPT = gql`
mutation DeleteScript($scriptId: ID!) {
  deleteScript(scriptId: $scriptId) {
    status
  }
}
`;
