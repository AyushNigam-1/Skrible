import { connectDB } from "./database/database";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import { graphqlServer } from "./graphql/server";
import cors from "cors";
import morgan from "morgan";
import { authenticate } from "./middleware/middleware";
import cookieParser from "cookie-parser";

dotenv.config();

const startServer = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
  const port = Number(process.env.PORT) || 4000;

  await connectDB(uri);

  const server = graphqlServer();
  await server.start();
  const app = express();
  app.use(morgan("dev"));
  app.use(cookieParser()); // Middleware for reading cookies
  app.use(express.json());
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://10.207.18.43:5173",
        "http://10.207.18.43:4173",
        "http://localhost:4173",
        "https://sorts-invitations-road-sets.trycloudflare.com",
      ],
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    }),
  );

  app.use(authenticate);

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        user: req.user || null,
      }),
    }),
  );

  app.listen(port, "0.0.0.0", () =>
    console.log(`Server started on port ${port}`),
  );
};

startServer();
