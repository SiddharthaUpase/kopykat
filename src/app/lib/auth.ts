import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          await connectDB();
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          });
          
          if (!user) {
            console.log('No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }

          const isPasswordCorrect = credentials.password === user.password;

          if (!isPasswordCorrect) {
            console.log('Password incorrect for user:', credentials.email);
            throw new Error('Invalid email or password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null,
            image: user.image || null,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google') {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            await User.create({
              email: user.email?.toLowerCase(),
              name: user.name,
              image: user.image,
              googleId: user.id,
            });
          }
        }
        return true;
      } catch (error) {
        console.error('Sign in callback error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub!,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/generate`;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}; 