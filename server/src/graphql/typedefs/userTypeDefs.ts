import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  type User {
    id: ID
    username: String!
    email: String!
    token: String!
    languages: [String]
    bio: String
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
  }

  type Mutation {
    register(username: String!, password: String!, email: String): User
    login(username: String!, password: String!): User
    logout: Boolean!
    
  }
`;
