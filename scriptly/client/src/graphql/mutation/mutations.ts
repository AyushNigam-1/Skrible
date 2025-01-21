import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
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

export const ADD_SCRIPT = gql(`
    mutation Mutation($title:String!,$visibility:String!,$language:String!){
      createScript(title:$title,visibility:$visibility,language:$language){
        title
      }
    }
    `)

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
  }
`;
