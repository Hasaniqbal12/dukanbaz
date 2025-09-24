import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../../models/User';
import { dbConnect } from '../../../../lib/mongodb';
import bcrypt from 'bcryptjs';
// These imports are needed for module declaration augmentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from 'next-auth/jwt';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Session } from 'next-auth';
// Import User model
// import { IUser } from '../../../../models/User'; // Commented out as not directly used

// Extend the built-in session types
// Define custom user type for NextAuth
interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare module 'next-auth' {
  interface Session {
    user: CustomUser;
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    name?: string;
    email?: string;
  }
}

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: { email?: string; password?: string } | undefined): Promise<{ id: string; name: string; email: string; role: string } | null> {
        try {
          await dbConnect();
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log('User not found');
            return null;
          }
          
          console.log('User found: Yes');
          
          if (credentials.password) {
            const isValidPassword = await bcrypt.compare(credentials.password, user.password);
            console.log('Password valid:', isValidPassword);
            
            if (isValidPassword) {
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
          return null;
        } catch (error: unknown) {
          console.error('Auth error:', error instanceof Error ? error.message : 'Unknown error');
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
        token.name = customUser.name;
        token.email = customUser.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string || '';
        session.user.role = token.role as string || 'buyer';
        session.user.name = token.name as string || '';
        session.user.email = token.email as string || '';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-12345',
  pages: {
    signIn: '/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export { authOptions }; 