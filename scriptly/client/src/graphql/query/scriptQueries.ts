import { gql } from '@apollo/client'

export const GET_ALL_SCRIPTS = gql`
  query GetAllScripts {
    getAllScripts {
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
        author
        comments{
          text
        }
      }
    }
  }

`;

export const GET_SCRIPT_BY_ID = gql`
  query GetScriptById($id: ID!) {
    getScriptById(id: $id) {
      id
      title
      visibility
      languages
      genres
      description
      paragraphs {
        id
        text
        createdAt
        likes
        dislikes
        author
        comments{
          text
        }
      }
    }
  }
`;
