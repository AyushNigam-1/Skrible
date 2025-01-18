import { gql } from '@apollo/client'

export const getAllScripts = gql(`
query Query {
    getAllScripts {
    genre
  }
} 
` )

