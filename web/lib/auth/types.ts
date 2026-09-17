export interface AuthSession {
  userId: string;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResult {
  /** Reserved for adapters that surface a client-side reset token. */
  demoToken?: string;
}

export interface ResetPasswordInput {
  /** Optional token for adapters that use query-token reset flows. */
  token?: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class AuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export interface AuthService {
  signUp(input: AuthCredentials): Promise<AuthSession>;
  signIn(input: AuthCredentials): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  requestPasswordReset(input: PasswordResetRequest): Promise<PasswordResetResult>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
  changePassword(input: ChangePasswordInput): Promise<void>;
}
