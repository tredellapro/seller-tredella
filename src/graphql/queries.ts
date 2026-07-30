import { gql } from '@apollo/client';

// App queries live here — same pattern as easyfloors-frontend.
export const GET_ALL_ADMINS = gql`
  query GetAllAdmins {
    admins {
      id
      name
      email
    }
  }
`;
