"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { formatDisplayDate, getSessionPhase } from "@/lib/constants";
import { fetchSessionInviteeIds } from "@/lib/supabase/data";
import {
  friendIdForUser,
  resolvePerson,
  useAppStore,
  useCurrentUserId,
} from "@/lib/store/app-store";
import { buildSessionSharePayload, shareOrCopy } from "@/lib/share";
import type { User } from "@/lib/types";

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
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alreadyInvitedIds, setAlreadyInvitedIds] = useState<string[]>([]);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const sessions = useAppStore((s) => s.sessions);
  const people = useAppStore((s) => s.people);
  const friendships = useAppStore((s) => s.friendships);
  const currentUser = useAppStore((s) => s.currentUser);
  const joinedSessionIds = useAppStore((s) => s.joinedSessionIds);
  const joinSession = useAppStore((s) => s.joinSession);
  const leaveSession = useAppStore((s) => s.leaveSession);
  const inviteToSession = useAppStore((s) => s.inviteToSession);
  const meId = useCurrentUserId();

  const session = sessions.find((item) => item.id === id);
  const isJoined = joinedSessionIds.includes(id);

  useEffect(() => {
    if (!isInviteOpen) return;

    let cancelled = false;
    void fetchSessionInviteeIds(id)
      .then((ids) => {
        if (!cancelled) setAlreadyInvitedIds(ids);
      })
      .catch(() => {
        if (!cancelled) setAlreadyInvitedIds([]);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isInviteOpen]);

  const friendIds = useMemo(() => {
    if (!meId) return new Set<string>();
    return new Set(
      friendships
        .filter((item) => item.status === "accepted")
        .map((item) => friendIdForUser(item, meId)),
    );
  }, [friendships, meId]);

  const inviteCandidates = useMemo(() => {
    if (!session || !meId) {
      return { friends: [] as User[], others: [] as User[] };
    }

    const excluded = new Set<string>([
      meId,
      ...session.attendeeIds,
      ...alreadyInvitedIds,
    ]);
    const query = inviteSearch.trim().toLowerCase();

    const eligible = people.filter((person) => {
      if (excluded.has(person.id)) return false;
      if (!query) return true;
      return (
        person.name.toLowerCase().includes(query) ||
        person.role.toLowerCase().includes(query)
      );
    });

    return {
      friends: eligible.filter((person) => friendIds.has(person.id)),
      others: eligible.filter((person) => !friendIds.has(person.id)),
    };
  }, [
    alreadyInvitedIds,
    friendIds,
    inviteSearch,
    meId,
    people,
    session,
  ]);

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

  function openInvite() {
    setSelectedIds([]);
    setInviteSearch("");
    setInviteError(null);
    setInviteStatus(null);
    setIsInviteOpen(true);
  }

  function closeInvite() {
    setIsInviteOpen(false);
    setSelectedIds([]);
    setInviteSearch("");
    setInviteError(null);
  }

  function toggleSelected(personId: string) {
    setSelectedIds((current) =>
      current.includes(personId)
        ? current.filter((item) => item !== personId)
        : [...current, personId],
    );
  }

  async function handleSendInvites() {
    if (selectedIds.length === 0 || isInviting) return;
    setIsInviting(true);
    setInviteError(null);

    const errorMessage = await inviteToSession(id, selectedIds);
    setIsInviting(false);

    if (errorMessage) {
      setInviteError(errorMessage);
      return;
    }

    setInviteStatus(`Undangan terkirim ke ${selectedIds.length} orang`);
    closeInvite();
    window.setTimeout(() => setInviteStatus(null), 2500);
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
            aria-label="Bagikan link"
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
            onClick={openInvite}
            className="btn-secondary mt-3 w-full"
          >
            invite
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={isSharing}
            className="mt-3 w-full text-center text-sm font-semibold text-accent disabled:opacity-50"
          >
            {isSharing ? "sharing..." : "Bagikan link"}
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

          {inviteStatus ? (
            <p
              role="status"
              className="mt-3 text-center text-sm font-semibold text-accent"
            >
              {inviteStatus}
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

      {isInviteOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-0 sm:items-center sm:px-4">
          <button
            type="button"
            aria-label="Tutup"
            className="absolute inset-0"
            onClick={closeInvite}
          />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-[430px] flex-col rounded-t-[28px] bg-surface shadow-[var(--shadow)] sm:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-bold text-ink">Undang orang</h2>
              <button
                type="button"
                onClick={closeInvite}
                className="text-sm font-semibold text-muted"
              >
                Tutup
              </button>
            </div>

            <div className="px-5 pt-4">
              <input
                value={inviteSearch}
                onChange={(event) => setInviteSearch(event.target.value)}
                placeholder="Cari nama..."
                className="w-full rounded-[var(--radius-sm)] border-0 bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 ring-accent focus:ring-2"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {inviteCandidates.friends.length === 0 &&
              inviteCandidates.others.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  Tidak ada orang yang bisa diundang.
                </p>
              ) : (
                <div className="space-y-5">
                  {inviteCandidates.friends.length > 0 ? (
                    <InvitePeopleSection
                      title="Teman"
                      people={inviteCandidates.friends}
                      selectedIds={selectedIds}
                      onToggle={toggleSelected}
                    />
                  ) : null}
                  {inviteCandidates.others.length > 0 ? (
                    <InvitePeopleSection
                      title="Lainnya"
                      people={inviteCandidates.others}
                      selectedIds={selectedIds}
                      onToggle={toggleSelected}
                    />
                  ) : null}
                </div>
              )}
            </div>

            <div className="border-t border-line px-5 py-4 pb-[calc(1rem+var(--safe-bottom))]">
              {inviteError ? (
                <p className="mb-3 rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-700">
                  {inviteError}
                </p>
              ) : null}
              <button
                type="button"
                disabled={selectedIds.length === 0 || isInviting}
                onClick={() => void handleSendInvites()}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isInviting
                  ? "Mengirim..."
                  : `Kirim undangan${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InvitePeopleSection({
  title,
  people,
  selectedIds,
  onToggle,
}: {
  title: string;
  people: User[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">
        {title}
      </h3>
      <ul className="space-y-2">
        {people.map((person) => {
          const isSelected = selectedIds.includes(person.id);
          return (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => onToggle(person.id)}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-left transition ${
                  isSelected ? "bg-accent-soft" : "bg-bg"
                }`}
              >
                <Avatar initials={person.initials} hue={person.avatarHue} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{person.name}</p>
                  <p className="truncate text-sm text-muted">
                    {person.role}
                    {person.company ? ` · ${person.company}` : ""}
                  </p>
                </div>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold ${
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-line text-transparent"
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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
