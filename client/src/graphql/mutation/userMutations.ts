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