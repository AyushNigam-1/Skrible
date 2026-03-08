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
      console.error("Invalid JWT token");
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
    ];

    const isIntrospection =
      query.includes("__schema") || query.includes("__type");
    const isAllowed =
      (operationName && allowedOperations.includes(operationName)) ||
      isIntrospection;

    if (!req.user && !isAllowed) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No valid token provided" });
    }
  }

  next();
};
