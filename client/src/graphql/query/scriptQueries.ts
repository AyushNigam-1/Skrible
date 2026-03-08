import { gql } from "@apollo/client";

export const GET_SCRIPT_BY_ID = gql`
  query GetScriptById($id: ID!) {
    getScriptById(id: $id) {
      id
      title
      visibility
      languages
      genres
      description
      createdAt
      combinedText
      likes
      dislikes

      author {
        id
        username
      }

      collaborators {
        role
        user {
          id
          username
        }
      }

      paragraphs {
        id
        text
        status
        likes
        dislikes
        createdAt
        author {
          id
          username
        }
        comments {
          author {
            id
            username
          }
          text
          createdAt
        }
      }
    }
  }
`;

export const GET_SCRIPTS_BY_GENRES = gql`
  query GetScriptsByGenres($genres: [String!]!) {
    getScriptsByGenres(genres: $genres) {
      id
      title
      genres
      description
      likes
      languages
      dislikes
      createdAt
      author {
        username
      }
    }
  }
`;

export const GET_SCRIPT_CONTRIBUTORS = gql`
  query GetScriptContributors($scriptId: ID!) {
    getScriptContributors(scriptId: $scriptId) {
      contributors {
        userId
        details {
          name
          paragraphs {
            id
            text
            status
            createdAt
            likes
            dislikes
            author {
              username
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
      }
    }
  }
`;
