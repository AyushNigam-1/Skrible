import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import { bearer } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: mongodbAdapter(db),
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trustedOrigins: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://skribe-workspace.vercel.app"
    ],
    plugins: [
        bearer()
    ],
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                unique: true,
            },
            favourites: {
                type: "string[]",
                required: false,
                defaultValue: [],
                input: false,
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
                            finalUsername = `${baseUsername}${counter}`;
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
        sendResetPassword: async ({ user, url }) => {
            console.log(`[TESTING] Password reset link for ${user.email}: ${url}`);

            try {
                await resend.emails.send({
                    from: "Skrible <onboarding@resend.dev>",
                    to: user.email,
                    subject: "Reset your Skrible password",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #111;">Reset Your Password</h2>
                            <p style="color: #444; line-height: 1.5;">Hi ${user.name || 'there'},</p>
                            <p style="color: #444; line-height: 1.5;">Someone recently requested a password change for your Skrible account. If this was you, you can set a new password here:</p>
                            
                            <div style="margin: 30px 0;">
                                <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                    Reset Password
                                </a>
                            </div>

                            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                        </div>
                    `
                });
                console.log(`[SUCCESS] Reset email sent to ${user.email}`);
            } catch (error) {
                console.error("[ERROR] Failed to send password reset email:", error);
            }
        },
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
    advanced: {
        defaultCookieAttributes: {
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        }
    }
});