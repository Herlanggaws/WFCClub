"use client";

import { FormEvent, useState } from "react";
import {
  AuthButton,
  AuthErrorBanner,
  AuthField,
  AuthLink,
  AuthShell,
} from "@/components/AuthForm";
import { AuthError, auth } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await auth.requestPasswordReset({ email });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : "Gagal mengirim reset. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="cek email"
        subtitle="Kalau email terdaftar, kami kirim link reset password."
        footer={
          <>
            Kembali ke <AuthLink href="/login">masuk</AuthLink>
          </>
        }
      >
        <div className="rounded-[var(--radius-sm)] bg-[#f7f3ea] px-5 py-4 text-sm leading-relaxed text-muted">
          Cek inbox (dan spam) untuk lanjut ganti password.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="lupa password"
      subtitle="Masukkan email akunmu. Kami kirim link untuk ganti password."
      footer={
        <>
          Ingat password? <AuthLink href="/login">Masuk</AuthLink>
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
        <AuthButton loading={loading} disabled={!email.trim()}>
          kirim link
        </AuthButton>
      </form>
    </AuthShell>
  );
}
