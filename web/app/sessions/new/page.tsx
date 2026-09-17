"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { todayIsoDate } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function CreateSessionPage() {
  const router = useRouter();
  const createSession = useAppStore((s) => s.createSession);

  const [place, setPlace] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("16:00");
  const [note, setNote] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!place.trim() || submitting) return;

    setSubmitting(true);
    try {
      const id = await createSession({
        place,
        date,
        startTime,
        endTime,
        note,
        topic,
      });
      if (id) router.replace(`/sessions/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="saya lagi wfc"
        subtitle="Biar orang lain bisa join."
        backHref="/home"
      />

      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6 animate-rise">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Tempat</span>
          <input
            required
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="Nama café / coworking"
            className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Tanggal</span>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
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
              className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Selesai</span>
            <input
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-ink">
            Catatan <span className="font-normal text-muted">(opsional)</span>
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Misal: Kerja product. Silakan sapa."
            className="mt-2 w-full resize-none rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">
            Topik <span className="font-normal text-muted">(opsional)</span>
          </span>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Startup, Design, AI…"
            className="mt-2 w-full rounded-[var(--radius-sm)] border-0 bg-surface px-4 py-3.5 shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || !place.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Buat sesi WFC"}
        </button>
      </form>
    </div>
  );
}
