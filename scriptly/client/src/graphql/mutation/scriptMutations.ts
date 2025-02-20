import { gql } from '@apollo/client';

export const ADD_SCRIPT = gql`
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
`;

export const CREATE_REQUEST = gql`
  mutation CreateRequest($scriptId: ID!, $text: String!) {
    createRequest(scriptId: $scriptId, text: $text ) {
            _id
            author {
              username
            }
            status
            likes
            dislikes
            comments{
              text
            }
            text
            createdAt
    }
  }
`;
export const ACCEPT_REQUEST = gql`
  mutation AcceptRequest($scriptId: ID!, $requestId: ID!) {
    acceptRequest(scriptId: $scriptId, requestId: $requestId) {
      id
      paragraphs {
        text
        author{
          username
        }
        likes
        dislikes
        comments {
          text
          author{
            username
          }
          createdAt
        }
      }
      requests {
        _id
        text
        author{
          username
        }
        status
        likes
        dislikes
        comments {
          text
          author{
            username
          }
          createdAt
        }
      }
    }
  }
`;
export const MARK_AS_INTERESTED = gql`
  mutation MarkAsInterested($scriptId: ID!) {
    markAsInterested(scriptId: $scriptId) {
      status
    }
  }
`;

export const MARK_AS_NOT_INTERESTED = gql`
  mutation MarkAsNotInterested($scriptId: ID!) {
    markAsNotInterested(scriptId: $scriptId) {
      status
    }
  }
`;

export const MARK_AS_FAVOURITE = gql`
  mutation MarkAsFavourite($scriptId: ID!) {
    markAsFavourite(scriptId: $scriptId) {
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
