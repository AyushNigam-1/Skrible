import { connectDB } from "./database/database";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import { graphqlServer } from "./graphql/server";
import cors from "cors";
import morgan from "morgan";
import { authenticate } from "./middleware/middleware";
import cookieParser from "cookie-parser";
import { redisClient } from "./database/redis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

dotenv.config();

const startServer = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
  const port = Number(process.env.PORT) || 4000;

  await connectDB(uri);
  await redisClient.connect();

  const server = graphqlServer();
  await server.start();
  const app = express();

  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://10.43.186.43:5173/"
      ],
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    }),
  );

  app.use(authenticate);

  const graphqlLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      errors: [
        {
          message:
            "Too many requests from this IP, please try again after 15 minutes.",
          extensions: { code: "TOO_MANY_REQUESTS" },
        },
      ],
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(
    "/graphql",
    graphqlLimiter,
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        user: req.user || null,
        redis: redisClient,
      }),
    }),
  );

  app.listen(port, "0.0.0.0", () =>
    console.log(`Server started on port ${port}`),
  );
};

startServer();
