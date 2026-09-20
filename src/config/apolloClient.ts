import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getToken } from 'lib/token';

const httpLink = new HttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:4000/graphql'
});

/* Read the cookie per request rather than once at module load, so a sign-in or
   sign-out takes effect without a reload. */
const authLink = setContext((_operation, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    // auth screens must never read a stale cache
    mutate: { errorPolicy: 'none' }
  }
});

export default client;
