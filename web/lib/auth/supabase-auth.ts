import { MIN_PASSWORD_LENGTH } from "../constants";
import { getSupabaseBrowserClient } from "../supabase/client";
import {
  AuthError,
  type AuthCredentials,
  type AuthService,
  type AuthSession,
  type ChangePasswordInput,
  type PasswordResetRequest,
  type PasswordResetResult,
  type ResetPasswordInput,
} from "./types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      "weak_password",
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    );
  }
}

function mapSession(userId: string, email: string | undefined): AuthSession {
  if (!email) {
    throw new AuthError("invalid_session", "Session tidak valid.");
  }
  return { userId, email };
}

function mapAuthError(error: { message: string; code?: string }): AuthError {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (
    code.includes("user_already_exists") ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return new AuthError("email_taken", "Email sudah terdaftar.");
  }

  if (
    code.includes("invalid_credentials") ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return new AuthError("invalid_credentials", "Email atau password salah.");
  }

  if (
    code.includes("weak_password") ||
    (message.includes("password") && message.includes("least"))
  ) {
    return new AuthError(
      "weak_password",
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    );
  }

  if (message.includes("email") && message.includes("invalid")) {
    return new AuthError("invalid_email", "Email tidak valid.");
  }

  return new AuthError(code || "auth_error", error.message);
}

function resetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`;
}

export const supabaseAuth: AuthService = {
  async signUp({ email, password }: AuthCredentials): Promise<AuthSession> {
    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes("@")) {
      throw new AuthError("invalid_email", "Email tidak valid.");
    }
    validatePassword(password);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalized,
      password,
    });

    if (error) throw mapAuthError(error);

    if (!data.session || !data.user) {
      throw new AuthError(
        "check_email",
        "Cek email untuk konfirmasi akun sebelum masuk.",
      );
    }

    return mapSession(data.user.id, data.user.email ?? normalized);
  },

  async signIn({ email, password }: AuthCredentials): Promise<AuthSession> {
    const normalized = normalizeEmail(email);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });

    if (error) throw mapAuthError(error);
    if (!data.user) {
      throw new AuthError("invalid_credentials", "Email atau password salah.");
    }

    return mapSession(data.user.id, data.user.email ?? normalized);
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw mapAuthError(error);
  },

  async getSession(): Promise<AuthSession | null> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw mapAuthError(error);

    const user = data.session?.user;
    if (!user?.email) return null;

    return mapSession(user.id, user.email);
  },

  async requestPasswordReset({
    email,
  }: PasswordResetRequest): Promise<PasswordResetResult> {
    const normalized = normalizeEmail(email);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: resetRedirectUrl(),
    });

    if (error) throw mapAuthError(error);
    return {};
  },

  async resetPassword({ password }: ResetPasswordInput): Promise<void> {
    validatePassword(password);

    const supabase = getSupabaseBrowserClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw mapAuthError(sessionError);
    if (!sessionData.session) {
      throw new AuthError(
        "invalid_token",
        "Link reset tidak valid atau sudah kedaluwarsa.",
      );
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw mapAuthError(error);

    await supabase.auth.signOut();
  },

  async changePassword({
    currentPassword,
    newPassword,
  }: ChangePasswordInput): Promise<void> {
    validatePassword(newPassword);

    if (currentPassword === newPassword) {
      throw new AuthError(
        "same_password",
        "Password baru harus berbeda dari password saat ini.",
      );
    }

    const supabase = getSupabaseBrowserClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw mapAuthError(sessionError);

    const email = sessionData.session?.user.email;
    if (!email) {
      throw new AuthError("not_authenticated", "Kamu perlu masuk dulu.");
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (reauthError) {
      throw new AuthError("invalid_credentials", "Password saat ini salah.");
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw mapAuthError(error);
  },

  async deleteAccount(_userId: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw mapAuthError(error);
  },
};
