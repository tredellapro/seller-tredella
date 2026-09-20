import { ApolloError } from '@apollo/client';

/* The backend puts a human-readable sentence in the GraphQL error message
   (BAD_USER_INPUT / FORBIDDEN / UNAUTHENTICATED), so surface that rather than
   Apollo's wrapper text. */
export const errorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (error instanceof ApolloError) {
    const first = error.graphQLErrors?.[0]?.message;
    if (first) return first;
    if (error.networkError)
      return 'Could not reach the server. Check your connection and try again.';
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** Extension code of the first GraphQL error, e.g. 'FORBIDDEN'. */
export const errorCode = (error: unknown): string | null => {
  if (error instanceof ApolloError)
    return (error.graphQLErrors?.[0]?.extensions?.code as string) ?? null;
  return null;
};
