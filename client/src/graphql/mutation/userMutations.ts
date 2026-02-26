import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
      token
    }
  }`;

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      email
      token
    }
  }`;

export const LOGOUT_MUTATION = gql`
mutation Logout {
    logout
}
`;
export const TOGGLE_BOOKMARK = gql`
  mutation ToggleBookmark($scriptId: ID!) {
    toggleBookmark(scriptId: $scriptId) {
      status
    }
  }
`;
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $username: String
    $bio: String
    $languages: [String!]
    $interests: [String!]
  ) {
    updateUserProfile(
      username: $username
      bio: $bio
      languages: $languages
      interests: $interests
    ) {
      id
      username
      bio
      languages
      interests
    }
  }
`;