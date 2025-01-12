import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          accountType: 'google'
        };
      },
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

          //decrypt password
          const decryptedPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!user) {
            console.log('No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }

          const isPasswordCorrect = decryptedPassword;

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
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        
        if (account?.provider === 'google') {
          const headersList = await headers();
          const forwardedFor = headersList.get('x-forwarded-for');
          const clientIP = forwardedFor ? forwardedFor.split(',')[0] : '0.0.0.0';

          // Try to find user by email or googleId
          let existingUser = await User.findOne({
            $or: [
              { email: user.email?.toLowerCase() },
              { googleId: profile?.sub }
            ]
          });

          if (existingUser) {
            // Update existing user's Google ID if they didn't have one
            if (!existingUser.googleId) {
              existingUser.googleId = profile?.sub;
              existingUser.image = user.image;
              existingUser.accountType = 'google';
              existingUser.lastLogin = new Date();
              await existingUser.save();
            }
          } else {
            // Create new user with required fields
            existingUser = await User.create({
              email: user.email?.toLowerCase(),
              name: user.name || 'Unknown',
              image: user.image,
              googleId: profile?.sub,
              registrationIP: clientIP,
              accountType: 'google',
              lastLogin: new Date()
            });
          }

          // Add the database user id to the user object
          user.id = existingUser._id.toString();
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