"use client";

import Link from "next/link";
import { AvatarCluster } from "./AvatarCluster";
import { formatDisplayDate, formatPriceIdr } from "@/lib/constants";
import {
  resolvePerson,
  useAppStore,
  useCurrentUserId,
} from "@/lib/store/app-store";
import type { CommunityEvent } from "@/lib/types";

interface EventRowProps {
  event: CommunityEvent;
  isRsvped?: boolean;
}

export function EventRow({ event, isRsvped }: EventRowProps) {
  const people = useAppStore((s) => s.people);
  const currentUser = useAppStore((s) => s.currentUser);
  const meId = useCurrentUserId();

  const attendees = event.attendeeIds
    .map((id) => resolvePerson(people, currentUser, id, meId))
    .filter((person): person is NonNullable<typeof person> => person !== null);

  return (
    <Link
      href={`/events/${event.id}`}
      className="card-surface block px-5 py-5 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-muted">
            {formatDisplayDate(event.date)} · {event.startTime}
          </p>
          <h3 className="mt-2 text-[17px] font-bold leading-snug text-ink">
            {event.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted">
            📍 {event.place} · {formatPriceIdr(event.priceIdr)}
          </p>
          {isRsvped ? (
            <p className="mt-3 text-xs font-semibold text-live">✓ Kamu terdaftar</p>
          ) : (
            <span className="btn-primary mt-4 px-4 py-2 text-sm">
              join
              <span aria-hidden>→</span>
            </span>
          )}
        </div>
        <AvatarCluster
          people={attendees}
          totalCount={event.attendeeIds.length}
        />
      </div>
    </Link>
  );
}
