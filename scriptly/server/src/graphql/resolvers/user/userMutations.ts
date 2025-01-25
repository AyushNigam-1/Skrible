import { GraphQLError } from 'graphql';
import User from "../../../models/User";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Response } from 'express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "jwt";

export const userMutations = {
    register: async (_: any, { username, password, email }: { username: string; password: string; email?: string }, { res }: { res: Response }) => {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new GraphQLError('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '1D' });

        // Set the token in the cookie
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true, // Helps mitigate XSS attacks
            secure: process.env.NODE_ENV === 'production', // Ensure it's only sent over HTTPS in production
            sameSite: 'none', // Important for cross-site requests
            maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
        });

        return {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            token, // You can return the token in the response as well, if needed
            languages: newUser.languages,
            bio: newUser.bio,
            interests: newUser.interests,
            likes: newUser.likes,
            followers: newUser.followers,
            views: newUser.views,
            scripts: newUser.scripts,
            follows: newUser.follows,
        };
    },

    login: async (_: any, { username, password }: { username: string; password: string }, { res }: { res: Response }) => {
        const user = await User.findOne({ username });
        if (!user) {
            throw new GraphQLError('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new GraphQLError('Invalid username or password');
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1D' });

        // Set the token in the cookie
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true, // Helps mitigate XSS attacks
            secure: process.env.NODE_ENV === 'production', // Ensure it's only sent over HTTPS in production
            sameSite: 'none', // Important for cross-site requests
            maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
        });

        return {
            id: user._id,
            username: user.username,
            email: user.email,
            token, // You can return the token in the response as well, if needed
            languages: user.languages,
            bio: user.bio,
            interests: user.interests,
            likes: user.likes,
            followers: user.followers,
            views: user.views,
            scripts: user.scripts,
            follows: user.follows,
        };
    },
};
