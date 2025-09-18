import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
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
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  pages: {
    signIn: '/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export { authOptions }; 