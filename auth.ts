import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db'
import client from './lib/db/client'

import GoogleProvider from 'next-auth/providers/google'
import NextAuth, { type DefaultSession } from 'next-auth'
import authConfig from './authConfig'
import User from './lib/db/models/user'

declare module 'next-auth' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      _id: string
      role: string
    } & DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/',
    newUser: '/register',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(client),
  providers: [

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

    }),
    CredentialsProvider({
      credentials: {
        email: {
          type: 'email',
        },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase()
        if (credentials == null) return null

        const user = await User.findOne({ email: credentials.email })

        if (user && user.password) {
          const isMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          if (isMatch) {
            return {
              id: user._id.toString(), // Pastikan _id dikonversi ke string
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
            }
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        if (!user.name) {
          await connectToDatabase();
          await User.findByIdAndUpdate(user.id, {
            name: user.name || user.email!.split("@")[0],
            role: "user",
          });
        }
        token._id = (user as { id: string }).id; // Tambahkan `_id`
        token.name = user.name || user.email!.split("@")[0];
        token.role = (user as { role: string }).role;
      }

      if (session?.user?.name && trigger === "update") {
        token.name = session.user.name;
      }
      return token;
    },
    session: async ({ session, user, trigger, token }) => {
      session.user.id = token.sub as string;
      session.user._id = token._id as string
      session.user.role = token.role as string;
      session.user.name = token.name;
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    }
  },
})