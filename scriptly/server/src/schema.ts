import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    hello: String
  }
`;

export const resolvers = {
  Query: {
    hello: () => 'Hello, GraphQL with TypeScript!',
  },
};
