const BASE_URL = 'https://seller.tredella.com';

const image = {
  src: `${BASE_URL}/assets/images/logo.webp`,
  alt: 'Tredella'
};

export const pageMetadataData = {
  HomePage: {
    title: 'Tredella Seller | Sell Online in UAE',
    description:
      'Tredella Seller Center — manage your products, orders and store on Tredella, the UAE online marketplace.',
    url: `${BASE_URL}`,
    image,
    canonical: `${BASE_URL}`
  },
  LoginPage: {
    title: 'Log in | Tredella Seller',
    description:
      'Sign in to your Tredella Seller Center to manage products, orders and payouts.',
    url: `${BASE_URL}/login`,
    image,
    canonical: `${BASE_URL}/login`
  },
  SignUpPage: {
    title: 'Create your seller account | Tredella',
    description:
      'Open a Tredella seller account and start selling to retail and wholesale buyers across the UAE.',
    url: `${BASE_URL}/signup`,
    image,
    canonical: `${BASE_URL}/signup`
  },
  ForgotPasswordPage: {
    title: 'Forgot password | Tredella Seller',
    description:
      'Request a reset code and get back into your Tredella Seller Center.',
    url: `${BASE_URL}/forgot-password`,
    image,
    canonical: `${BASE_URL}/forgot-password`
  },
  ResetPasswordPage: {
    title: 'Reset password | Tredella Seller',
    description: 'Enter your reset code and choose a new password.',
    url: `${BASE_URL}/reset-password`,
    image,
    canonical: `${BASE_URL}/reset-password`
  }
};
