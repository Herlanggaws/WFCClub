"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthButton,
  AuthErrorBanner,
  AuthField,
  AuthLink,
  AuthShell,
} from "@/components/AuthForm";
import { AuthError, auth } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    async function checkExistingSession() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setHasRecoverySession(true);
        setReady(true);
      }
    }

    void checkExistingSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (
        event === "PASSWORD_RECOVERY" ||
        (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION"))
      ) {
        setHasRecoverySession(true);
        setReady(true);
      }
    });

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 2500);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.clearTimeout(timeoutId);
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword({ password });
      router.replace("/login");
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : "Gagal reset password. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <AuthShell title="password baru" subtitle="Memuat link reset...">
        <div className="flex justify-center py-10">
          <div
            className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#d1d1d6] border-t-[#8e8e93]"
            aria-label="loading"
          />
        </div>
      </AuthShell>
    );
  }

  if (!hasRecoverySession) {
    return (
      <AuthShell
        title="link tidak valid"
        subtitle="Minta link reset baru dari halaman lupa password."
        footer={
          <>
            <AuthLink href="/forgot-password">Minta link baru</AuthLink>
          </>
        }
      >
        <AuthErrorBanner message="Link reset tidak valid atau sudah kedaluwarsa." />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="password baru"
      subtitle="Pilih password baru untuk akunmu."
      footer={
        <>
          Kembali ke <AuthLink href="/login">masuk</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthErrorBanner message={error} />
        <AuthField
          label="password baru"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={`minimal ${MIN_PASSWORD_LENGTH} karakter`}
          autoComplete="new-password"
          autoFocus
        />
        <AuthField
          label="konfirmasi password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="ulangi password"
          autoComplete="new-password"
        />
        <AuthButton
          loading={loading}
          disabled={!password || !confirmPassword}
        >
          simpan password
        </AuthButton>
      </form>
    </AuthShell>
  );
}
