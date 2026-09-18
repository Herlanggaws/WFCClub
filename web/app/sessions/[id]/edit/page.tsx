"use client";

import { type FormEvent, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import {
  INTERESTS,
  isEndAfterStart,
  isSessionEnded,
  isSessionStartInPast,
} from "@/lib/constants";
import { useAppStore, useCurrentUserId } from "@/lib/store/app-store";

const OTHER_TOPIC = "Lainnya";

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const meId = useCurrentUserId();
  const sessions = useAppStore((s) => s.sessions);
  const updateSession = useAppStore((s) => s.updateSession);

  const session = sessions.find((item) => item.id === id);

  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [topicPreset, setTopicPreset] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hydratedForm, setHydratedForm] = useState(false);

  useEffect(() => {
    if (!session || hydratedForm) return;

    setPlace(session.place);
    setDate(session.date);
    setStartTime(session.startTime);
    setEndTime(session.endTime);
    setNote(session.note ?? "");

    if (session.topic && INTERESTS.includes(session.topic as (typeof INTERESTS)[number])) {
      setTopicPreset(session.topic);
    } else if (session.topic) {
      setTopicPreset(OTHER_TOPIC);
      setCustomTopic(session.topic);
    }

    setHydratedForm(true);
  }, [session, hydratedForm]);

  if (!session) {
    return (
      <div>
        <PageHeader title="edit sesi" backHref="/home" />
        <div className="px-4 py-4">
          <EmptyState
            title="Sesi tidak ditemukan"
            description="Kembali ke Home untuk lihat WFC hari ini."
            action={
              <Link href="/home" className="btn-primary text-sm">
                ke home
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const isHost = meId === session.createdById;
  const ended = isSessionEnded(session.date, session.endTime);

  if (!isHost || ended) {
    return (
      <div>
        <PageHeader title="edit sesi" backHref={`/sessions/${id}`} />
        <div className="px-4 py-4">
          <EmptyState
            title={ended ? "Sesi sudah selesai" : "Tidak bisa edit"}
            description={
              ended
                ? "Sesi yang sudah lewat jam selesai tidak bisa diedit."
                : "Hanya pembuat sesi yang bisa mengubah detail ini."
            }
            action={
              <Link href={`/sessions/${id}`} className="btn-primary text-sm">
                kembali ke sesi
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const resolvedTopic =
    topicPreset === OTHER_TOPIC
      ? customTopic.trim()
      : topicPreset?.trim() || "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!place.trim() || submitting) return;

    if (!isEndAfterStart(startTime, endTime)) {
      setError("Jam selesai harus setelah jam mulai.");
      return;
    }

    if (isSessionStartInPast(date, startTime)) {
      setError("Jam mulai tidak boleh di masa lalu.");
      return;
    }

    if (topicPreset === OTHER_TOPIC && !customTopic.trim()) {
      setError("Isi topik untuk pilihan Lainnya.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const message = await updateSession(id, {
        place,
        date,
        startTime,
        endTime,
        note,
        topic: resolvedTopic,
      });
      if (message) {
        setError(message);
        return;
      }
      router.replace(`/sessions/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="edit sesi"
        subtitle="Ubah detail sebelum jam selesai."
        backHref={`/sessions/${id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6 animate-rise">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Tempat</span>
          <input
            required
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="Nama café / coworking"
            className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 text-ink shadow-[var(--shadow)] outline-none ring-accent placeholder:text-muted/70 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Tanggal</span>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 text-ink shadow-[var(--shadow)] outline-none ring-accent placeholder:text-muted/70 focus:ring-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Mulai</span>
            <input
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 text-ink shadow-[var(--shadow)] outline-none ring-accent placeholder:text-muted/70 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Selesai</span>
            <input
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 text-ink shadow-[var(--shadow)] outline-none ring-accent placeholder:text-muted/70 focus:ring-2"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-ink">
            Catatan <span className="font-normal text-muted">(opsional)</span>
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Misal: Kerja product. Silakan sapa."
            className="mt-2 w-full resize-none rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 text-ink shadow-[var(--shadow)] outline-none ring-accent placeholder:text-muted/70 focus:ring-2"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-ink">
            Topik <span className="font-normal text-muted">(opsional)</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                selected={topicPreset === interest}
                onClick={() =>
                  setTopicPreset((current) =>
                    current === interest ? null : interest,
                  )
                }
              />
            ))}
            <Chip
              label={OTHER_TOPIC}
              selected={topicPreset === OTHER_TOPIC}
              onClick={() =>
                setTopicPreset((current) =>
                  current === OTHER_TOPIC ? null : OTHER_TOPIC,
                )
              }
            />
          </div>
          {topicPreset === OTHER_TOPIC ? (
            <input
              value={customTopic}
              onChange={(event) => setCustomTopic(event.target.value)}
              placeholder="Tulis topikmu"
              className="mt-3 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 text-ink shadow-[var(--shadow)] outline-none ring-accent placeholder:text-muted/70 focus:ring-2"
            />
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || !place.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </form>
    </div>
  );
}
