"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PersonCard } from "@/components/PersonCard";
import { todayIsoDate } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const people = useAppStore((s) => s.people);
  const sessions = useAppStore((s) => s.sessions);
  const currentUser = useAppStore((s) => s.currentUser);
  const today = todayIsoDate();

  const wfcTodayIds = useMemo(() => {
    return new Set(
      sessions
        .filter((session) => session.date === today)
        .flatMap((session) => session.attendeeIds),
    );
  }, [sessions, today]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const ranked = [...people].sort((a, b) => {
      const aScore =
        (currentUser?.interests.some((i) => a.interests.includes(i)) ? 2 : 0) +
        (wfcTodayIds.has(a.id) ? 1 : 0);
      const bScore =
        (currentUser?.interests.some((i) => b.interests.includes(i)) ? 2 : 0) +
        (wfcTodayIds.has(b.id) ? 1 : 0);
      return bScore - aScore;
    });

    if (!normalized) return ranked;

    return ranked.filter((person) => {
      const haystack = [
        person.name,
        person.role,
        person.company ?? "",
        ...person.interests,
        ...person.lookingFor,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [people, query, currentUser, wfcTodayIds]);

  return (
    <div>
      <PageHeader
        title="people"
        subtitle="Temukan orang relevan di komunitas."
      />

      <div className="px-4 py-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, role, atau interest"
          className="w-full rounded-full border-0 bg-surface px-5 py-3.5 text-sm shadow-[var(--shadow)] outline-none ring-accent focus:ring-2"
        />

        <section className="mt-6">
          <h2 className="mb-3 px-1 text-[15px] font-bold text-ink">
            {query.trim() ? "Hasil" : "Disarankan buat kamu"}
          </h2>

          {filtered.length === 0 ? (
            <EmptyState
              title="Tidak ketemu"
              description="Coba kata lain—misal developer, design, atau AI."
            />
          ) : (
            <div className="space-y-3 animate-rise">
              {filtered.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  isWfcToday={wfcTodayIds.has(person.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
