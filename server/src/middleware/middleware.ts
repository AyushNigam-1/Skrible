import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      req.user = { id: decoded.id };
    } catch (error) {
      // 1. Log the actual reason (e.g., "jwt expired") to help with debugging
      console.error(
        "⚠️ JWT Verification failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      // We don't return 401 here yet. We let req.user stay undefined
      // so the allowlist logic below can do its job.
    }
  }

  if (req.path === "/graphql") {
    const operationName = req.body.operationName;
    const query = req.body.query || "";

    const allowedOperations = [
      "Register",
      "Login",
      "GetAllScripts",
      "GetScriptById",
      "GetScriptsByGenres",
      "Logout",
      "ExportDocument",
      "IntrospectionQuery",
      // Just in case you start using operation names for your refresh mutation
      "RefreshToken",
    ];

    const isIntrospection =
      query.includes("__schema") || query.includes("__type");

    // 2. CRITICAL FIX: Explicitly allow the refresh mutation to pass
    // even if it lacks an operationName from the frontend fetch
    const isRefresh = query.includes("refreshToken");

    const isAllowed =
      (operationName && allowedOperations.includes(operationName)) ||
      isIntrospection ||
      isRefresh;

    if (!req.user && !isAllowed) {
      // 3. CRITICAL FIX: Return a beautifully formatted GraphQL error.
      // This guarantees your frontend Apollo errorLink catches the "UNAUTHENTICATED" code!
      return res.status(401).json({
        errors: [
          {
            message: "Unauthorized: Token expired or missing",
            extensions: { code: "UNAUTHENTICATED" },
          },
        ],
      });
    }
  }

  next();
};
