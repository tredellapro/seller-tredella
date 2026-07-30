import { SessionStrategy, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import client from 'config/apolloClient';
import { LOGIN_USER } from 'graphql/user-mutation';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import Cookies from 'js-cookie';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const { data } = await client.mutate({
            mutation: LOGIN_USER,
            variables: {
              userLogin: {
                email: credentials?.email,
                password: credentials?.password
              }
            }
          });

          const user = data?.userLogin;

          if (!user || !user.token) {
            return null;
          }

          Cookies.set('user_token', user.token, {
            expires: 1 // 1 day
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt' as SessionStrategy
  },
  secret: process.env.NEXTAUTH_SECRET
};
