import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation UserLogin($userLogin: UserLoginInput!) {
    userLogin(userLogin: $userLogin) {
      id
      name
      email
      token
    }
  }
`;
