import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

export const graphqlServer = () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  return server
}