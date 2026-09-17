"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthButton, AuthErrorBanner } from "@/components/AuthForm";
import { Chip } from "@/components/Chip";
import { PageHeader } from "@/components/PageHeader";
import {
  createFeedbackRow,
  type FeedbackCategory,
} from "@/lib/supabase/data";
import { useAppStore } from "@/lib/store/app-store";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "saran", label: "Saran" },
  { value: "lainnya", label: "Lainnya" },
];

const MIN_MESSAGE_LENGTH = 10;

export default function FeedbackPage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);

  const [category, setCategory] = useState<FeedbackCategory>("saran");
  const [message, setMessage] = useState("");
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

    const trimmed = message.trim();
    if (trimmed.length < MIN_MESSAGE_LENGTH) {
      setError(`Pesan minimal ${MIN_MESSAGE_LENGTH} karakter.`);
      return;
    }

    setLoading(true);

    try {
      await createFeedbackRow({
        userId: session.userId,
        category,
        message: trimmed,
      });
      setSuccess(true);
      setMessage("");
      window.setTimeout(() => {
        router.replace("/profile");
      }, 1200);
    } catch {
      setError("Gagal kirim feedback. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="kirim feedback"
        subtitle="Laporkan bug, kasih saran, atau cerita apa saja."
        backHref="/profile"
      />

      <div className="px-6 py-4 animate-rise">
        <div className="mx-auto w-full max-w-[360px]">
          {success ? (
            <p
              role="status"
              className="mb-4 rounded-[var(--radius-sm)] bg-accent/10 px-4 py-3 text-sm font-medium text-accent"
            >
              Terima kasih! Feedbackmu sudah terkirim.
            </p>
          ) : null}

          <form onSubmit={handleSubmit}>
            <AuthErrorBanner message={error} />

            <div className="mb-4">
              <span className="mb-2 block text-[13px] font-semibold lowercase text-muted">
                kategori
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    selected={category === item.value}
                    onClick={() => setCategory(item.value)}
                  />
                ))}
              </div>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-[13px] font-semibold lowercase text-muted">
                pesan
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Ceritakan yang kamu alami atau harapkan…"
                disabled={success}
                className="w-full resize-none rounded-[var(--radius-sm)] border-0 bg-[#f7f3ea] px-5 py-3.5 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/70 focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
              />
            </label>

            <AuthButton
              loading={loading}
              disabled={!message.trim() || success}
            >
              kirim feedback
            </AuthButton>
          </form>
        </div>
      </div>
    </div>
  );
}
