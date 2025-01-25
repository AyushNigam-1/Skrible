import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

declare global {
    namespace Express {
        interface Request {
            user: {
                id: string;
            };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {

    if (req.path === '/graphql' && req.body.operationName && (req.body.operationName === 'Register' || req.body.operationName === 'Login')) {
        return next();
    }
    console.log(req.body.operationName)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};
