import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { bearer } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db),
    // 🚨 This MUST be your Vercel URL
    baseURL: "https://skribe-workspace.vercel.app",
    trustedOrigins: [
        "https://skribe-workspace.vercel.app",
        "http://localhost:5173"
    ],
    plugins: [
        bearer()
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        }
    }
});