import { GET_ALL_ADMINS } from 'graphql/queries';
import client from './apolloClient';
import { DocumentNode } from '@apollo/client';

export const get_allAdmins = async (token: string | undefined) => {
  try {
    const { data } = await client.query({
      query: GET_ALL_ADMINS,
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    return data?.admins || [];
  } catch (error) {
    return error;
  }
};

export const fetchQuery = async (
  QUERY: DocumentNode,
  tags: string[] = [],
  variables?: Record<string, unknown>
) => {
  try {
    const { data } = await client.query({
      query: QUERY,
      variables,
      fetchPolicy: 'no-cache',
      context: {
        fetchOptions: {
          credentials: 'include',
          next: { tags }
        }
      }
    });
    return data;
  } catch (error) {
    return null;
  }
};
