import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db),
    trustedOrigins: [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                unique: true,
            }
        }
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
                    let finalUsername = baseUsername;
                    let isUnique = false;
                    let counter = 0;
                    while (!isUnique) {
                        const existing = await db.collection("user").findOne({ username: finalUsername });

                        if (!existing) {
                            isUnique = true;
                        } else {
                            counter++;
                            finalUsername = `${baseUsername}${counter}`; // e.g., "john.smith1"
                        }
                    }
                    return {
                        data: {
                            ...user,
                            username: finalUsername,
                        }
                    };
                }
            }
        }
    },

    emailAndPassword: {
        enabled: true,
    },
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
});