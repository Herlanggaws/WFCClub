"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthButton,
  AuthErrorBanner,
  AuthField,
} from "@/components/AuthForm";
import { PageHeader } from "@/components/PageHeader";
import { AuthError, auth } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function ChangePasswordPage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!session) {
      setError("Kamu perlu masuk dulu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    setLoading(true);

    try {
      await auth.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.replace("/profile");
      }, 1200);
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : "Gagal ubah password. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="ubah password"
        subtitle="Ganti password akunmu yang sedang aktif."
        backHref="/profile"
      />

      <div className="px-6 py-4 animate-rise">
        <div className="mx-auto w-full max-w-[360px]">
          {session?.email ? (
            <p className="mb-6 text-center text-[13px] text-muted">
              {session.email}
            </p>
          ) : null}

          {success ? (
            <p
              role="status"
              className="mb-4 rounded-[var(--radius-sm)] bg-accent/10 px-4 py-3 text-sm font-medium text-accent"
            >
              Password berhasil diubah. Kembali ke profile...
            </p>
          ) : null}

          <form onSubmit={handleSubmit}>
            <AuthErrorBanner message={error} />
            <AuthField
              label="password saat ini"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="password lama"
              autoComplete="current-password"
              autoFocus
            />
            <AuthField
              label="password baru"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder={`minimal ${MIN_PASSWORD_LENGTH} karakter`}
              autoComplete="new-password"
            />
            <AuthField
              label="konfirmasi password baru"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="ulangi password baru"
              autoComplete="new-password"
            />
            <AuthButton
              loading={loading}
              disabled={
                !currentPassword || !newPassword || !confirmPassword || success
              }
            >
              simpan password
            </AuthButton>
          </form>
        </div>
      </div>
    </div>
  );
}
