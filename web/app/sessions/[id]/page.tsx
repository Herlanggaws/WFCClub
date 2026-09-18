"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { formatDisplayDate, getSessionPhase } from "@/lib/constants";
import {
  resolvePerson,
  useAppStore,
  useCurrentUserId,
} from "@/lib/store/app-store";
import { buildSessionSharePayload, shareOrCopy } from "@/lib/share";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ctaPop, setCtaPop] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const sessions = useAppStore((s) => s.sessions);
  const people = useAppStore((s) => s.people);
  const currentUser = useAppStore((s) => s.currentUser);
  const joinedSessionIds = useAppStore((s) => s.joinedSessionIds);
  const joinSession = useAppStore((s) => s.joinSession);
  const leaveSession = useAppStore((s) => s.leaveSession);
  const meId = useCurrentUserId();

  const session = sessions.find((item) => item.id === id);
  const isJoined = joinedSessionIds.includes(id);

  if (!session) {
    return (
      <div>
        <PageHeader title="session" backHref="/home" />
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

  const activeSession = session;
  const phase = getSessionPhase(
    activeSession.date,
    activeSession.startTime,
    activeSession.endTime,
  );
  const isPlanned = phase === "planned";
  const canEdit =
    meId === activeSession.createdById && phase !== "ended";
  const attendeeCountLabel = isPlanned
    ? `${activeSession.attendeeIds.length} orang akan ikut`
    : `${activeSession.attendeeIds.length} orang ikut`;
  const attendeeSectionTitle = isPlanned
    ? "orang yang akan ikut"
    : "orang yang ikut";
  const joinedStatusLabel = isPlanned
    ? "✓ kamu rencana ikut sesi ini"
    : "✓ kamu ikut di sesi ini";

  const attendees = activeSession.attendeeIds
    .map((attendeeId) =>
      resolvePerson(people, currentUser, attendeeId, meId),
    )
    .filter((person): person is NonNullable<typeof person> => person !== null);

  async function handleToggle() {
    setCtaPop(true);
    window.setTimeout(() => setCtaPop(false), 500);
    setJoinError(null);

    if (isJoined) {
      void leaveSession(id);
      return;
    }

    const errorMessage = await joinSession(id);
    if (errorMessage) setJoinError(errorMessage);
  }

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);
    setShareStatus(null);

    try {
      const url = new URL(
        `/sessions/${activeSession.id}`,
        window.location.origin,
      ).href;
      const result = await shareOrCopy(
        buildSessionSharePayload({
          place: activeSession.place,
          dateLabel: formatDisplayDate(activeSession.date),
          startTime: activeSession.startTime,
          endTime: activeSession.endTime,
          topic: activeSession.topic,
          url,
        }),
      );

      if (result === "copied") {
        setShareStatus("Link undangan disalin");
      } else if (result === "shared") {
        setShareStatus("Siap dibagikan");
      }
    } catch {
      setShareStatus("Gagal share. Coba salin URL manual.");
    } finally {
      setIsSharing(false);
      window.setTimeout(() => setShareStatus(null), 2500);
    }
  }

  return (
    <div>
      <PageHeader
        title={activeSession.place}
        backHref="/home"
        action={
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={isSharing}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:bg-black/5 disabled:opacity-50"
            aria-label="Bagikan undangan"
          >
            <ShareIcon />
          </button>
        }
      />

      <div className="px-4 py-4 animate-rise">
        <div className="card-surface px-5 py-6">
          <p className="text-[13px] font-medium text-muted">
            {formatDisplayDate(activeSession.date)} · {activeSession.startTime}{" "}
            – {activeSession.endTime}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-ink">
            {attendeeCountLabel}
          </p>

          {activeSession.note ? (
            <p className="mt-4 rounded-[var(--radius-sm)] bg-accent-soft px-4 py-3 text-sm leading-relaxed text-ink">
              “{activeSession.note}”
            </p>
          ) : null}

          {activeSession.topic ? (
            <p className="mt-3 text-xs font-semibold text-muted">
              Topik · {activeSession.topic}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleToggle()}
            className={`mt-6 w-full ${ctaPop ? "animate-cta-pop" : ""} ${
              isJoined ? "btn-secondary" : "btn-primary"
            }`}
          >
            {isJoined ? (
              "leave"
            ) : (
              <>
                join <span aria-hidden>→</span>
              </>
            )}
          </button>

          {joinError ? (
            <p className="mt-3 rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-700">
              {joinError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={isSharing}
            className="btn-secondary mt-3 w-full disabled:opacity-50"
          >
            {isSharing ? "sharing..." : "invite"}
          </button>

          {canEdit ? (
            <Link
              href={`/sessions/${activeSession.id}/edit`}
              className="btn-secondary mt-3 flex w-full items-center justify-center"
            >
              edit sesi
            </Link>
          ) : null}

          {isJoined ? (
            <p className="mt-3 text-center text-sm font-semibold text-live">
              {joinedStatusLabel}
            </p>
          ) : null}

          {shareStatus ? (
            <p
              role="status"
              className="mt-3 text-center text-sm font-semibold text-accent"
            >
              {shareStatus}
            </p>
          ) : null}
        </div>

        <section className="mt-6">
          <h2 className="mb-3 px-1 text-[15px] font-bold text-ink">
            {attendeeSectionTitle}
          </h2>
          <ul className="space-y-3">
            {attendees.map((person) => (
              <li key={person.id}>
                <Link
                  href={
                    person.id === meId ? "/profile" : `/people/${person.id}`
                  }
                  className="card-surface flex items-center gap-3 px-4 py-3.5"
                >
                  <Avatar initials={person.initials} hue={person.avatarHue} />
                  <div className="min-w-0">
                    <p className="font-bold text-ink">
                      {person.name}
                      {person.id === meId ? " (kamu)" : ""}
                    </p>
                    <p className="text-sm text-muted">
                      {person.role}
                      {person.company ? ` · ${person.company}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8.5 11 15.5 6.5M8.5 13l7 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
