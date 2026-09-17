"use client";

import { use } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { todayIsoDate } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const people = useAppStore((s) => s.people);
  const sessions = useAppStore((s) => s.sessions);
  const person = people.find((item) => item.id === id);
  const today = todayIsoDate();

  const isWfcToday = sessions.some(
    (session) =>
      session.date === today && session.attendeeIds.includes(id),
  );

  if (!person) {
    return (
      <div className="px-5 py-6">
        <PageHeader title="Profil" backHref="/people" />
        <EmptyState
          title="Orang tidak ditemukan"
          description="Kembali ke direktori People."
          action={
            <Link href="/people" className="btn-primary text-sm">
              Ke People
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="profil" backHref="/people" />

      <div className="px-4 py-4 animate-rise">
        <div className="card-surface px-5 py-6">
          <div className="flex items-center gap-4">
            <Avatar initials={person.initials} hue={person.avatarHue} size="xl" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                {person.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {person.role}
                {person.company ? ` · ${person.company}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted">📍 {person.city}</p>
            </div>
          </div>

          {isWfcToday ? (
            <p className="mt-5 rounded-full bg-live-soft px-4 py-2 text-center text-sm font-semibold text-live">
              ● WFC hari ini
            </p>
          ) : null}

          {person.about ? (
            <section className="mt-7">
              <h3 className="text-[15px] font-bold text-ink">Tentang</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{person.about}</p>
            </section>
          ) : null}

          <section className="mt-7">
            <h3 className="text-[15px] font-bold text-ink">Interests</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.interests.map((interest) => (
                <Chip key={interest} label={interest} />
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h3 className="text-[15px] font-bold text-ink">Looking for</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.lookingFor.map((item) => (
                <Chip key={item} label={item} selected />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
