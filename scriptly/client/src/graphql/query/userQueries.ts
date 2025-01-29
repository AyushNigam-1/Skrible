import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    id
    username
    email
    bio
    languages
    interests
    likes
    followers
    follows
    scripts
    views
  }
} `