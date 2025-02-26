import { gql } from '@apollo/client'

export const GET_ALL_SCRIPTS = gql`
  query GetAllScripts {
    getAllScripts {
      _id
      title
      genres
      description
    }
  }

`;

export const GET_SCRIPT_BY_ID = gql`
  query GetScriptById($id: ID!) {
    getScriptById(id: $id) {
      _id
      title
      visibility
      languages
      genres
      description
      createdAt
      combinedText
      requests {
        _id
        createdAt
         author {
          username
        }
        status
        likes
        dislikes
        text
        comments {
          text
        }
        }
      author{
        username
      }
      paragraphs {
        id
        text
        likes
        dislikes
        createdAt
        comments{
          text
        }
        author{
          username
        }
      }
    }
  }
`;
