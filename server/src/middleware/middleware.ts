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

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body.operationName)
    if (req.path === '/graphql') {
        const operationName = req.body.operationName;

        const allowedOperations = ['Register', 'Login', 'GetAllScripts', 'GetScriptById', 'GetScriptsByGenres', 'Logout', 'ExportDocument'];
        if (operationName && allowedOperations.includes(operationName)) {
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
