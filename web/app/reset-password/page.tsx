"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthButton,
  AuthErrorBanner,
  AuthField,
  AuthLink,
  AuthShell,
} from "@/components/AuthForm";
import { AuthError, auth } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Link reset tidak valid atau sudah kedaluwarsa.");
      return;
    }

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
      await auth.resetPassword({ token, password });
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

  if (!token) {
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
        <AuthErrorBanner message="Token reset tidak ditemukan di URL." />
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="password baru" subtitle="Memuat...">
          <div className="flex justify-center py-10">
            <div
              className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#d1d1d6] border-t-[#8e8e93]"
              aria-label="loading"
            />
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
