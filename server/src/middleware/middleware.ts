import { Request, Response, NextFunction } from "express";
import { auth } from "../auth"; // <-- Point this to your new auth.ts file
import { fromNodeHeaders } from "better-auth/node";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email?: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Let Better Auth securely verify the cookies/headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // 2. Attach the user if the session is valid
    if (session?.user) {
      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      };
    }
  } catch (error) {
    console.error("⚠️ Better Auth Session Check Failed:", error);
  }

  if (req.path === "/graphql") {
    const operationName = req.body?.operationName;
    const query = req.body?.query || "";

    // Removed "RefreshToken" and "Logout" as Better Auth handles those automatically via REST!
    const allowedOperations = [
      "Register",
      "Login",
      "GetAllScripts",
      "GetScriptById",
      "GetScriptsByGenres",
      "ExportDocument",
      "IntrospectionQuery",
    ];

    const isIntrospection =
      query.includes("__schema") || query.includes("__type");

    const isAllowed =
      (operationName && allowedOperations.includes(operationName)) ||
      isIntrospection;

    if (!req.user && !isAllowed) {
      // 3. Return the exact same Apollo error format your frontend expects
      return res.status(401).json({
        errors: [
          {
            message: "Unauthorized: Session expired or missing",
            extensions: { code: "UNAUTHENTICATED" },
          },
        ],
      });
    }
  }

  next();
};