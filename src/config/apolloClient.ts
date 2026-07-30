import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_BASE_URL, // GraphQL API endpoint
    credentials: 'include' // ✅ Send cookies with every request
  }),
  cache: new InMemoryCache()
});

export default client;
