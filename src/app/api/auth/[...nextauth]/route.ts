import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../../models/User';
import { dbConnect } from '../../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

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
          console.log('User found:', user ? 'Yes' : 'No');
          
          if (user && credentials.password) {
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
        } catch (error) {
          console.error('Auth error:', error);
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
    async jwt({ token, user }: { token: JWT; user?: { id: string; name: string; email: string; role: string } }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT & { id?: string; role?: string } }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
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

const handler = NextAuth(authOptions) as any;
export { handler as GET, handler as POST };
export { authOptions }; 