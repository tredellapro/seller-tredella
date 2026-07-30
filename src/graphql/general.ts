import { gql } from '@apollo/client';

export const FIND_ONE_REDIRECT_URL = gql`
  mutation FindOneRedirectUrl($url: String!) {
    findOneRedirecturl(url: $url) {
      id
      url
      redirectedUrl
      status
    }
  }
`;
