import { gql } from '@apollo/client';

/* Mirrors backend-tredella's auth surface. `requireRole: SELLER` is what stops
   a buyer account signing into this dashboard. */

export const LOGIN_SELLER = gql`
  mutation LoginSeller($email: String!, $password: String!) {
    login(email: $email, password: $password, requireRole: SELLER) {
      token
      user {
        id
        name
        email
        role
        avatar
      }
    }
  }
`;

export const REGISTER_SELLER = gql`
  mutation RegisterSeller($input: SellerRegisterInput!) {
    registerSeller(input: $input) {
      token
      user {
        id
        name
        email
        role
        avatar
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET_CODE = gql`
  mutation RequestPasswordResetCode($email: String!) {
    requestPasswordResetCode(email: $email) {
      ok
      emailSent
    }
  }
`;

export const VERIFY_PASSWORD_RESET_CODE = gql`
  mutation VerifyPasswordResetCode($email: String!, $code: String!) {
    verifyPasswordResetCode(email: $email, code: $code) {
      token
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
      avatar
    }
  }
`;
