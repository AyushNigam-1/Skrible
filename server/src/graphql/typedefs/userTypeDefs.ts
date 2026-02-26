import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  type User {
    id: ID
    username: String!
    email: String!
    token: String!
    languages: [String]
    bio: String
    favourites:[ID]
    interests: [String]
    contibutions: [ID]
    likes: [ID]
    followers: [ID]
    views: [ID]
    scripts: [ID]
    follows: [ID]
  }
  type UserContribution {
  id: ID!
  status: String!
  text: String!
  likes: Int!
  dislikes: Int!
  createdAt: String!
  script: Script!
  comments: [Comment!]!
}

  type Query {
    getUserProfile(username: String!): User
    getUserScripts(userId: ID!): [Script!]!
    getUserContributions(userId: ID!): [UserContribution!]!
    getUserFavourites(userId: ID!): [Script!]!
  }

  type Mutation {
    register(username: String!, password: String!, email: String): User
    login(username: String!, password: String!): User
    logout: Boolean!
    toggleBookmark(scriptId: ID!): MutationResponse!
    updateUserProfile(
      username: String
      bio: String
      languages: [String!]
      interests: [String!]
    ): User!
  }
    
`;
