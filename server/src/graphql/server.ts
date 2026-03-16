import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typedefs/typedefs";
import { resolvers } from "./resolvers/resolvers";
import depthLimit from "graphql-depth-limit";

export const graphqlServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5)],
    introspection: process.env.NODE_ENV !== "production",
  });
}


