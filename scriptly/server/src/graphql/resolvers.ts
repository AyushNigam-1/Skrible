import { GraphQLError } from "graphql";
import Script from "../models/Script";
import User from "../models/User";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

export const resolvers = {
  Query: {

    getUserProfile: async (_: unknown,
      { id }: { id: string }) => {
      try {
        const user = await User.findById(id)
          .populate('scripts')
          .populate('likes')
          .populate('followers')
          .populate('follows')
          .populate('views');

        if (!user) {
          throw new Error('User not found');
        }

        return {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          languages: user.languages || [],
          interests: user.interests || [],
          likes: user.likes || [],
          followers: user.followers || [],
          follows: user.follows || [],
          scripts: user.scripts || [],
          views: user.views || [],
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    getAllScripts: async () => {
      try {
        const scripts = await Script.find();
        console.log(scripts)
        return scripts;
      } catch (error: any) {
        throw new Error(`Failed to fetch scripts: ${error.message}`);
      }
    },

    getScriptById: async (_: any, { id }: { id: string }) => {
      try {
        const script = await Script.findById(id);
        if (!script) {
          throw new Error('Script not found');
        }
        return script;
      } catch (error: any) {
        throw new Error(`Failed to fetch script: ${error.message}`);
      }
    },
  },

  Mutation: {
    createScript: async (_: any, { title, visibility, language }: any) => {
      try {
        const newScript = new Script({ title, visibility, language });
        await newScript.save();
        return newScript;
      } catch (error: any) {
        throw new Error(`Failed to create script: ${error.message}`);
      }
    },

    register: async (_: any, { username, password, email }: { username: string; password: string; email?: string }) => {
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

      const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET!, { expiresIn: '1D' });

      return {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token,
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

    login: async (_: any, { username, password }: any) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new GraphQLError('Invalid username or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid username or password');
      }

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET!, { expiresIn: '1h' });

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        token,
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
  },
}
