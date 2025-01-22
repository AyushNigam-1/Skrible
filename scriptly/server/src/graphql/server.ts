import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typedefs/typedefs";
import { resolvers } from "./resolvers/resolvers";

export const graphqlServer = () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  return server
}


