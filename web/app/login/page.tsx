"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthButton,
  AuthErrorBanner,
  AuthField,
  AuthLink,
  AuthShell,
} from "@/components/AuthForm";
import { AuthError, auth } from "@/lib/auth";
import { useAppStore } from "@/lib/store/app-store";

export default function LoginPage() {
  const router = useRouter();
  const applySession = useAppStore((s) => s.applySession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await auth.signIn({ email, password });
      await applySession(session);

      const { isOnboarded } = useAppStore.getState();
      router.replace(isOnboarded ? "/home" : "/onboarding");
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Gagal masuk. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="welcome back"
      subtitle="Masuk untuk lanjut WFC bareng komunitas."
      footer={
        <>
          Belum punya akun? <AuthLink href="/signup">Daftar</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthErrorBanner message={error} />
        <AuthField
          label="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="kamu@email.com"
          autoComplete="email"
          autoFocus
        />
        <AuthField
          label="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="minimal 8 karakter"
          autoComplete="current-password"
        />
        <p className="mb-2 text-right text-[13px]">
          <AuthLink href="/forgot-password">Lupa password?</AuthLink>
        </p>
        <AuthButton loading={loading} disabled={!email.trim() || !password}>
          masuk
        </AuthButton>
      </form>
    </AuthShell>
  );
}
