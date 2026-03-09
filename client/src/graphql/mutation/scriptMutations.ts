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

export const DELETE_SCRIPT = gql`
  mutation DeleteScript($scriptId: ID!) {
    deleteScript(scriptId: $scriptId) {
      status
    }
  }
`;
export const LIKE_SCRIPT = gql`
  mutation LikeScript($scriptId: ID!) {
    likeScript(scriptId: $scriptId) {
      status
    }
  }
`;

export const DISLIKE_SCRIPT = gql`
  mutation DislikeScript($scriptId: ID!) {
    dislikeScript(scriptId: $scriptId) {
      status
    }
  }
`;
export const ADD_COLLABORATOR = gql`
  mutation AddCollaborator($scriptId: ID!, $username: String!, $role: Role!) {
    addCollaborator(scriptId: $scriptId, username: $username, role: $role) {
      id
      collaborators {
        user {
          id
          username
        }
        role
      }
    }
  }
`;

export const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator($scriptId: ID!, $targetUserId: ID!) {
    removeCollaborator(scriptId: $scriptId, targetUserId: $targetUserId) {
      id
      collaborators {
        user {
          id
          username
        }
        role
      }
    }
  }
`;

export const UPDATE_COLLABORATOR_ROLE = gql`
  mutation UpdateCollaboratorRole(
    $scriptId: ID!
    $targetUserId: ID!
    $role: Role!
  ) {
    updateCollaboratorRole(
      scriptId: $scriptId
      targetUserId: $targetUserId
      role: $role
    ) {
      id
      collaborators {
        user {
          id
          username
        }
        role
      }
    }
  }
`;
export const UPDATE_SCRIPT = gql`
  mutation UpdateScript(
    $scriptId: ID!
    $title: String
    $description: String
    $visibility: String
  ) {
    updateScript(
      scriptId: $scriptId
      title: $title
      description: $description
      visibility: $visibility
    ) {
      id
      title
      description
      visibility
    }
  }
`;
