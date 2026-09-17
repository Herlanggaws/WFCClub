"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
  const [demoToken, setDemoToken] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await auth.requestPasswordReset({ email });
      setDemoToken(result.demoToken ?? null);
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
        {demoToken ? (
          <div className="mt-6 rounded-[var(--radius-sm)] border border-accent/20 bg-accent/5 px-5 py-4">
            <p className="text-[13px] font-bold lowercase text-accent">
              demo: buka link reset
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Di production ini dikirim lewat email. Untuk uji lokal, pakai link
              ini:
            </p>
            <Link
              href={`/reset-password?token=${encodeURIComponent(demoToken)}`}
              className="mt-3 block break-all text-sm font-semibold text-accent underline-offset-2 hover:underline"
            >
              /reset-password?token=…
            </Link>
          </div>
        ) : null}
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
