import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () =>
  console.log("✅ Redis Client Connected successfully"),
);
redisClient.on("reconnecting", () =>
  console.log("🔄 Redis Client Reconnecting..."),
);
