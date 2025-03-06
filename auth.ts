/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db'
import client from './lib/db/client'

import GoogleProvider from 'next-auth/providers/google'
import NextAuth, { type DefaultSession } from 'next-auth'
import authConfig from './authConfig'
import User from './lib/db/models/user'
import { pusherServer } from './lib/pusher/pusher'

// declare module 'next-auth' {
//   interface Session {
//     user: {
//       _id: string
//     } & DefaultSession['user']
//   }
// }

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   ...authConfig,
//   pages: {
//     signIn: '/login',
//     newUser: '/register',
//     error: '/login',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   adapter: MongoDBAdapter(client),
//   providers: [

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,

//     }),
//     CredentialsProvider({
//       credentials: {
//         email: {
//           type: 'email',
//         },
//         password: { type: 'password' },
//       },
//       async authorize(credentials) {
//         await connectToDatabase()
//         if (credentials == null) return null

//         const user = await User.findOne({ email: credentials.email })

//         if (user && user.password) {
//           const isMatch = await bcrypt.compare(
//             credentials.password as string,
//             user.password
//           )
//           if (isMatch) {
//             return {
//               id: user._id.toString(), // Pastikan _id dikonversi ke string
//               name: user.name,
//               email: user.email,
//               image: user.image,

//             }
//           }
//         }
//         return null
//       },
//     }),
//   ],
//   callbacks: {
//     jwt: async ({ token, user, trigger, session }) => {
//       if (user) {
//         if (!user.name) {
//           await connectToDatabase();
//           await User.findByIdAndUpdate(user.id, {
//             name: user.name || user.email!.split("@")[0],

//           });
//         }
//         token._id = (user as { id: string }).id; // Tambahkan `_id`
//         token.name = user.name || user.email!.split("@")[0];

//       }

//       if (session?.user?.name && trigger === "update") {
//         token.name = session.user.name;
//       }
//       return token;
//     },
//     session: async ({ session, user, trigger, token }) => {
//       session.user.id = token.sub as string;
//       session.user._id = token._id as string
//       session.user.name = token.name;

//       if (trigger === "update") {
//         session.user.name = user.name;
//       }
//       return session;
//     }
//   },
// })


declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      isOnline: boolean;
      lastSeen: Date;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(client),
  pages: {
    signIn: "/login",
    newUser: "/contacts",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        if (!credentials) return null;

        const user = await User.findOne({ email: credentials.email });

        if (user && user.password) {
          const isMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            // Set user online
            await User.findByIdAndUpdate(user._id, { isOnline: true });

            // Kirim event ke Pusher
            pusherServer.trigger("chat-app", "user-status", {
              userId: user._id.toString(),
              isOnline: true,
            });

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.image,
              isOnline: true,
              lastSeen: null,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      await connectToDatabase();

      if (user) {
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Jika user baru dari Google, buat akun dengan isOnline: true
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            isOnline: true,
            lastSeen: null, // Tambahkan lastSeen
          });
        } else {
          // Jika user sudah ada, update isOnline ke true
          await User.findByIdAndUpdate(existingUser._id, { isOnline: true });
        }

        // Kirim event ke Pusher
        pusherServer.trigger("chat-app", "user-status", {
          userId: existingUser._id.toString(),
          isOnline: true,
          lastSeen: null,
        });

        token._id = existingUser._id.toString();
        token.isOnline = true;
        token.lastSeen = null;
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user._id = token._id as string;
      session.user.id = token.sub as string;
      session.user.name = token.name;
      session.user.isOnline = token.isOnline as boolean;
      session.user.lastSeen = token.lastSeen as Date;

      return session;
    },
  },

  events: {
    signOut: async ({ token }: any) => {
      await connectToDatabase();
      await User.findByIdAndUpdate(token._id, { isOnline: false });

      const lastSeen = new Date(); // Simpan waktu terakhir dilihat
      await User.findByIdAndUpdate(token._id, { isOnline: false, lastSeen });
      // Kirim event ke Pusher
      pusherServer.trigger("chat-app", "user-status", {
        userId: token._id.toString(),
        isOnline: false,
        lastSeen,
      });
    },
  },
});

