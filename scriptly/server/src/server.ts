import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { connectDB } from './database/database';

import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
const port = Number(process.env.PORT) || 4000;

connectDB(uri)

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port },
  });

  console.log(`🚀 Server ready at ${url}`);
};

startServer().catch((error) => {
  console.error('Failed to start the server', error);
});
