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
    # scripts
    views
  }
} 
`

export const GET_USER_SCRIPTS = gql`
  query GetUserScripts($userId: ID!) {
    getUserScripts(userId: $userId) {
      _id
      title
      visibility
      description
      languages
      genres
      createdAt
      updatedAt
      author{
      username}
    }
  }
`;

export const GET_USER_CONTRIBUTIONS = gql`
  query GetUserContributions($userId: ID!) {
    getUserContributions(_id: $userId) {
      _id 
      # author
      status
      likes
      dislikes
      comments{
        text
      }
      text
      createdAt
      scriptId
      scriptTitle
  }
    }
`;