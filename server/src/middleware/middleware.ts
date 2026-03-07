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
  // console.log(req.body.operationName); // Good for debugging!

  if (req.path === "/graphql") {
    const operationName = req.body.operationName;
    const query = req.body.query || "";

    // 1. Add 'IntrospectionQuery' to your allowed list
    const allowedOperations = [
      "Register",
      "Login",
      "GetAllScripts",
      "GetScriptById",
      "GetScriptsByGenres",
      "Logout",
      "ExportDocument",
      "IntrospectionQuery", // <--- Added this
    ];

    // 2. Add a fallback check just in case the codegen tool doesn't send an operationName
    const isIntrospection =
      query.includes("__schema") || query.includes("__type");

    if (
      (operationName && allowedOperations.includes(operationName)) ||
      isIntrospection
    ) {
      return next();
    }
  }

  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
