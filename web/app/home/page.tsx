"use client";

import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EventRow } from "@/components/EventRow";
import { PersonCard } from "@/components/PersonCard";
import { SessionRow } from "@/components/SessionRow";
import { EmptyState } from "@/components/EmptyState";
import { greetingForNow, todayIsoDate } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function HomePage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const sessions = useAppStore((s) => s.sessions);
  const events = useAppStore((s) => s.events);
  const people = useAppStore((s) => s.people);
  const joinedSessionIds = useAppStore((s) => s.joinedSessionIds);
  const rsvpedEventIds = useAppStore((s) => s.rsvpedEventIds);
  const leaveSession = useAppStore((s) => s.leaveSession);
  const today = todayIsoDate();

  const todaySessions = sessions
    .filter((session) => session.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const wfcTodayIds = new Set(
    todaySessions.flatMap((session) => session.attendeeIds),
  );

  const suggestedPeople = people
    .filter((person) => {
      if (!currentUser) return true;
      const sharedInterests = person.interests.some((interest) =>
        currentUser.interests.includes(interest),
      );
      return sharedInterests || wfcTodayIds.has(person.id);
    })
    .slice(0, 3);

  const upcomingEvent = [...events]
    .filter((event) => event.date >= today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
    )[0];

  const firstName = currentUser?.name.split(" ")[0] ?? "teman";

  return (
    <div className="px-4 pb-6 pt-3">
      <header className="flex items-center justify-between px-1 animate-rise">
        <h1 className="font-brand text-[32px] font-extrabold lowercase tracking-tight text-ink">
          wfc
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
            aria-label="Events"
          >
            <BellIcon />
          </Link>
          <Link href="/profile" aria-label="Profile">
            {currentUser ? (
              <Avatar
                initials={currentUser.initials}
                hue={currentUser.avatarHue}
                size="md"
              />
            ) : null}
          </Link>
        </div>
      </header>

      <p className="mt-4 px-1 text-[15px] text-muted animate-rise-delay-1">
        {greetingForNow()}, {firstName}. Siapa yang WFC hari ini?
      </p>

      <section className="mt-5 animate-rise-delay-2">
        {todaySessions.length === 0 ? (
          <EmptyState
            title="Belum ada yang WFC"
            description="Tekan + untuk buat sesi biar orang lain bisa join."
          />
        ) : (
          <div className="space-y-3.5">
            {todaySessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isJoined={joinedSessionIds.includes(session.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9 px-1">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[15px] font-bold text-ink">Orang relevan</h2>
          <Link href="/people" className="text-sm font-semibold text-accent">
            Lihat semua
          </Link>
        </div>
        <div className="space-y-3">
          {suggestedPeople.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              isWfcToday={wfcTodayIds.has(person.id)}
            />
          ))}
        </div>
      </section>

      {upcomingEvent ? (
        <section className="mt-9 px-1">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-[15px] font-bold text-ink">Mendatang</h2>
            <Link href="/events" className="text-sm font-semibold text-accent">
              Semua event
            </Link>
          </div>
          <EventRow
            event={upcomingEvent}
            isRsvped={rsvpedEventIds.includes(upcomingEvent.id)}
          />
        </section>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9.5a6 6 0 1 1 12 0c0 3.2 1.1 4.6 1.8 5.5H4.2C4.9 14.1 6 12.7 6 9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
