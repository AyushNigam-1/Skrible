import { GraphQLError } from "graphql";
import Script from "../models/Script";
import User from "../models/User";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const JWT_SECRET = 'your_secret_key';

export const resolvers = {
  Query: {
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

      const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });

      return {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token,
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

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        token,
        // bio: user.bio,
      };
    },
  },
}
