import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      id
      name
      email
      token
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($name: String!, $password: String!) {
    login(name: $name, password: $password) {
      id
      name
      email
      token
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;


export const UPDATE_USER_PROFILE_FIELD = gql`
  mutation UpdateUserProfileField($key: String!, $value: String!) {
    updateUserProfileField(key: $key, value: $value) {
      id
      name
      bio
      languages
      interests
    }
  }
`;

export const LIKE_PROFILE = gql`
  mutation LikeProfile($profileId: ID!) {
    likeProfile(profileId: $profileId) {
      status
    }
  }
`;

export const VIEW_PROFILE = gql`
  mutation ViewProfile($profileId: ID!) {
    viewProfile(profileId: $profileId) {
      status
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($scriptId: ID!) {
    acceptInvitation(scriptId: $scriptId) {
      id
    }
  }
`;

export const DECLINE_INVITATION = gql`
  mutation DeclineInvitation($scriptId: ID!) {
    declineInvitation(scriptId: $scriptId) {
      id
    }
  }
`;