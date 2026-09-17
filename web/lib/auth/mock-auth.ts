import { AUTH_STORAGE_KEY, MIN_PASSWORD_LENGTH } from "../constants";
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

const DELAY_MS = 400;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

interface AccountRecord {
  id: string;
  email: string;
  password: string;
}

interface ResetTokenRecord {
  userId: string;
  expiresAt: number;
}

interface AuthStorage {
  accounts: AccountRecord[];
  session: AuthSession | null;
  resetTokens: Record<string, ResetTokenRecord>;
}

const EMPTY_STORAGE: AuthStorage = {
  accounts: [],
  session: null,
  resetTokens: {},
};

function delay(ms = DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readStorage(): AuthStorage {
  if (typeof window === "undefined") return { ...EMPTY_STORAGE };

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STORAGE, accounts: [], resetTokens: {} };

    const parsed = JSON.parse(raw) as Partial<AuthStorage>;
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      session: parsed.session ?? null,
      resetTokens:
        parsed.resetTokens && typeof parsed.resetTokens === "object"
          ? parsed.resetTokens
          : {},
    };
  } catch {
    return { ...EMPTY_STORAGE, accounts: [], resetTokens: {} };
  }
}

function writeStorage(storage: AuthStorage): void {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storage));
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      "weak_password",
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    );
  }
}

function createUserId(): string {
  return `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function createResetToken(): string {
  return `rt-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export const mockAuth: AuthService = {
  async signUp({ email, password }: AuthCredentials): Promise<AuthSession> {
    await delay();

    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes("@")) {
      throw new AuthError("invalid_email", "Email tidak valid.");
    }
    validatePassword(password);

    const storage = readStorage();
    if (storage.accounts.some((account) => account.email === normalized)) {
      throw new AuthError("email_taken", "Email sudah terdaftar.");
    }

    const account: AccountRecord = {
      id: createUserId(),
      email: normalized,
      password,
    };
    const session: AuthSession = {
      userId: account.id,
      email: account.email,
    };

    writeStorage({
      ...storage,
      accounts: [...storage.accounts, account],
      session,
    });

    return session;
  },

  async signIn({ email, password }: AuthCredentials): Promise<AuthSession> {
    await delay();

    const normalized = normalizeEmail(email);
    const storage = readStorage();
    const account = storage.accounts.find((item) => item.email === normalized);

    if (!account || account.password !== password) {
      throw new AuthError("invalid_credentials", "Email atau password salah.");
    }

    const session: AuthSession = {
      userId: account.id,
      email: account.email,
    };

    writeStorage({ ...storage, session });
    return session;
  },

  async signOut(): Promise<void> {
    await delay(200);
    const storage = readStorage();
    writeStorage({ ...storage, session: null });
  },

  async getSession(): Promise<AuthSession | null> {
    return readStorage().session;
  },

  async requestPasswordReset({
    email,
  }: PasswordResetRequest): Promise<PasswordResetResult> {
    await delay();

    const normalized = normalizeEmail(email);
    const storage = readStorage();
    const account = storage.accounts.find((item) => item.email === normalized);

    if (!account) {
      return {};
    }

    const token = createResetToken();
    const nextTokens = { ...storage.resetTokens };
    nextTokens[token] = {
      userId: account.id,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    };

    writeStorage({ ...storage, resetTokens: nextTokens });
    return { demoToken: token };
  },

  async resetPassword({ token, password }: ResetPasswordInput): Promise<void> {
    await delay();
    validatePassword(password);

    if (!token) {
      throw new AuthError(
        "invalid_token",
        "Link reset tidak valid atau sudah kedaluwarsa.",
      );
    }

    const resetToken = token;
    const storage = readStorage();
    const record = storage.resetTokens[resetToken];

    if (!record || record.expiresAt < Date.now()) {
      throw new AuthError(
        "invalid_token",
        "Link reset tidak valid atau sudah kedaluwarsa.",
      );
    }

    const accountIndex = storage.accounts.findIndex(
      (account) => account.id === record.userId,
    );
    if (accountIndex < 0) {
      throw new AuthError(
        "invalid_token",
        "Link reset tidak valid atau sudah kedaluwarsa.",
      );
    }

    const accounts = [...storage.accounts];
    accounts[accountIndex] = {
      ...accounts[accountIndex],
      password,
    };

    const resetTokens = { ...storage.resetTokens };
    delete resetTokens[resetToken];

    writeStorage({
      ...storage,
      accounts,
      resetTokens,
      session: null,
    });
  },

  async changePassword({
    currentPassword,
    newPassword,
  }: ChangePasswordInput): Promise<void> {
    await delay();
    validatePassword(newPassword);

    const storage = readStorage();
    if (!storage.session) {
      throw new AuthError("not_authenticated", "Kamu perlu masuk dulu.");
    }

    const accountIndex = storage.accounts.findIndex(
      (account) => account.id === storage.session?.userId,
    );
    if (accountIndex < 0) {
      throw new AuthError("not_authenticated", "Kamu perlu masuk dulu.");
    }

    const account = storage.accounts[accountIndex];
    if (account.password !== currentPassword) {
      throw new AuthError(
        "invalid_credentials",
        "Password saat ini salah.",
      );
    }

    if (currentPassword === newPassword) {
      throw new AuthError(
        "same_password",
        "Password baru harus berbeda dari password saat ini.",
      );
    }

    const accounts = [...storage.accounts];
    accounts[accountIndex] = { ...account, password: newPassword };
    writeStorage({ ...storage, accounts });
  },

  async deleteAccount(userId: string): Promise<void> {
    const storage = readStorage();
    const accounts = storage.accounts.filter((account) => account.id !== userId);
    const resetTokens = Object.fromEntries(
      Object.entries(storage.resetTokens).filter(
        ([, record]) => record.userId !== userId,
      ),
    );
    const session =
      storage.session?.userId === userId ? null : storage.session;

    writeStorage({ accounts, resetTokens, session });
  },
};
