export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatar?: string | null;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export interface LoginResult {
  login: AuthPayload;
}

export interface RegisterSellerResult {
  registerSeller: AuthPayload;
}

export interface RequestPasswordResetCodeResult {
  requestPasswordResetCode: { ok: boolean; emailSent: boolean };
}

export interface VerifyPasswordResetCodeResult {
  verifyPasswordResetCode: { token: string };
}

export interface ResetPasswordResult {
  resetPassword: AuthPayload;
}

export interface SellerRegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country?: string | null;
  storeName?: string | null;
}
