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

export const ADD_SCRIPT = gql(`
  mutation Add_Script(
      $title: String!,
      $visibility: String!,
      $languages: [String!]!,
      $genres: [String!]!,
      $description: String!,
      $paragraph: String!
  ) {
      createScript(
          title: $title,
          visibility: $visibility,
          languages: $languages,
          genres: $genres,
          description: $description,
          paragraph: $paragraph
      ) {
          id
          title
          visibility
          languages
          genres
          description
          paragraphs {
              text
              createdAt
              likes
              dislikes
              author{
                username
              }
              comments {
                text
              }
          }
      }
  }
`);

