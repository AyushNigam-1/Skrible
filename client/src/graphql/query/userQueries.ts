import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
query GetUserProfile($username: String!) {
  getUserProfile(username: $username) {
    id
    username
    email
    bio
    languages
    interests
    likes
    followers
    follows
    views
  }
}
`;

export const GET_USER_SCRIPTS = gql`
query GetUserScripts($userId: ID!) {
  getUserScripts(userId: $userId) {
    id
    title
    visibility
    description
    languages
    genres
    createdAt
    updatedAt
    author {
      username
    }
  }
}
`;

export const GET_USER_CONTRIBUTIONS = gql`
query GetUserContributions($userId: ID!) {
  getUserContributions(userId: $userId) {
    id
    status
    text
    likes
    dislikes
    createdAt
    script {
      id
    }
    comments {
      author {
        username
      }
      text
      createdAt
    }
  }
}
`;

export const GET_USER_FAVOURITES = gql`
query GetUserFavourites($userId: ID!) {
  getUserFavourites(userId: $userId) {
    id
    title
    visibility
    description
    languages
    genres
    createdAt
    updatedAt
    author {
      username
    }
  }
}
`;
