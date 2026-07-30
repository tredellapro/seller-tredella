import { DocumentNode } from 'graphql';
import client from './apolloClient';
import { FIND_ONE_REDIRECT_URL } from 'graphql/general';

export const findOneRedirectUrl = async (
  url: string,
  CUSTOM_MUTATION?: DocumentNode
) => {
  try {
    const { data } = await client.mutate({
      mutation: CUSTOM_MUTATION ? CUSTOM_MUTATION : FIND_ONE_REDIRECT_URL,
      variables: { url }
    });
    return data?.findOneRedirecturl || null;
  } catch (error) {
    return null;
  }
};
