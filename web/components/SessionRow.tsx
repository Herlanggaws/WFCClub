"use client";

import Link from "next/link";
import { AvatarCluster } from "./AvatarCluster";
import { getSessionPhase } from "@/lib/constants";
import {
  resolvePerson,
  useAppStore,
  useCurrentUserId,
} from "@/lib/store/app-store";
import type { WfcSession } from "@/lib/types";

interface SessionRowProps {
  session: WfcSession;
  isJoined?: boolean;
  onLeave?: (sessionId: string) => void;
}

export function SessionRow({ session, isJoined, onLeave }: SessionRowProps) {
  const people = useAppStore((s) => s.people);
  const currentUser = useAppStore((s) => s.currentUser);
  const meId = useCurrentUserId();

  const attendees = session.attendeeIds
    .map((id) => resolvePerson(people, currentUser, id, meId))
    .filter((person): person is NonNullable<typeof person> => person !== null);

  const host = attendees[0];
  const title = session.topic
    ? `${session.place} · ${session.topic}`
    : session.place;
  const phase = getSessionPhase(session.date, session.startTime, session.endTime);
  const joinedLabel =
    phase === "planned" ? "Kamu rencana ikut" : "Kamu ikut";

  return (
    <div
      className={`card-surface px-5 py-5 transition-transform active:scale-[0.99] ${
        isJoined ? "ring-2 ring-live bg-live-soft/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <Link href={`/sessions/${session.id}`} className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-[30%] text-[11px]"
              style={{
                background: host
                  ? `hsl(${host.avatarHue} 45% 88%)`
                  : "var(--line)",
              }}
            >
              ☕
            </span>
            <span className="truncate">
              {host?.name.split(" ")[0] ?? "WFC"} · {session.startTime}
            </span>
          </p>

          <h3 className="mt-2 text-[17px] font-bold leading-snug tracking-tight text-ink">
            {title}
          </h3>

          {session.note ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
              {session.note}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-muted">
              {session.startTime} – {session.endTime}
            </p>
          )}

          {isJoined ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live" />
              {joinedLabel}
            </p>
          ) : (
            <span className="btn-primary mt-4 inline-flex px-4 py-2 text-sm">
              join
              <span aria-hidden>→</span>
            </span>
          )}
        </Link>

        <div className="flex flex-col items-end gap-3">
          <AvatarCluster
            people={attendees}
            totalCount={session.attendeeIds.length}
          />
          {isJoined && onLeave ? (
            <button
              type="button"
              onClick={() => onLeave(session.id)}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              leave
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
