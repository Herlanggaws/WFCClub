"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { formatDisplayDate, formatPriceIdr } from "@/lib/constants";
import {
  resolvePerson,
  useAppStore,
  useCurrentUserId,
} from "@/lib/store/app-store";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ctaPop, setCtaPop] = useState(false);

  const events = useAppStore((s) => s.events);
  const people = useAppStore((s) => s.people);
  const currentUser = useAppStore((s) => s.currentUser);
  const rsvpedEventIds = useAppStore((s) => s.rsvpedEventIds);
  const rsvpEvent = useAppStore((s) => s.rsvpEvent);
  const cancelRsvp = useAppStore((s) => s.cancelRsvp);
  const meId = useCurrentUserId();

  const event = events.find((item) => item.id === id);
  const isRsvped = rsvpedEventIds.includes(id);

  if (!event) {
    return (
      <div className="px-5 py-6">
        <PageHeader title="Event" backHref="/events" />
        <EmptyState
          title="Event tidak ditemukan"
          description="Kembali ke daftar Events."
          action={
            <Link
              href="/events"
              className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Ke Events
            </Link>
          }
        />
      </div>
    );
  }

  const attendees = event.attendeeIds
    .map((attendeeId) =>
      resolvePerson(people, currentUser, attendeeId, meId),
    )
    .filter((person): person is NonNullable<typeof person> => person !== null);

  const spotsLeft = Math.max(event.capacity - event.attendeeIds.length, 0);

  function handleToggle() {
    setCtaPop(true);
    window.setTimeout(() => setCtaPop(false), 500);

    if (isRsvped) {
      void cancelRsvp(id);
      return;
    }
    void rsvpEvent(id);
  }

  return (
    <div>
      <PageHeader title="event" backHref="/events" />

      <div className="px-4 py-4 animate-rise">
        <div className="card-surface px-5 py-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            {event.title}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {formatDisplayDate(event.date)} · {event.startTime} – {event.endTime}
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">📍 {event.place}</p>
          <p className="mt-3 text-sm text-muted">
            {event.attendeeIds.length} / {event.capacity} bergabung ·{" "}
            {formatPriceIdr(event.priceIdr)}
          </p>
          {event.audience ? (
            <p className="mt-2 text-xs font-semibold text-muted">
              Untuk · {event.audience}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-muted">{spotsLeft} slot tersisa</p>

          <section className="mt-6">
            <h3 className="text-[15px] font-bold text-ink">Tentang</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {event.description}
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-[15px] font-bold text-ink">Yang bisa diharapkan</h3>
            <ul className="mt-2 space-y-2">
              {event.expectations.map((item) => (
                <li key={item} className="text-sm text-muted">
                  • {item}
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={handleToggle}
            className={`mt-7 w-full ${ctaPop ? "animate-cta-pop" : ""} ${
              isRsvped ? "btn-secondary" : "btn-primary"
            }`}
          >
            {isRsvped ? "Batalkan RSVP" : (
              <>
                join <span aria-hidden>→</span>
              </>
            )}
          </button>

          {isRsvped ? (
            <p className="mt-3 text-center text-sm font-semibold text-live">
              ✓ Spot kamu sudah direserve
            </p>
          ) : null}
        </div>

        <section className="mt-6">
          <h3 className="mb-3 px-1 text-[15px] font-bold text-ink">
            Orang yang ikut
          </h3>
          <ul className="space-y-3">
            {attendees.slice(0, 8).map((person) => (
              <li
                key={person.id}
                className="card-surface flex items-center gap-3 px-4 py-3"
              >
                <Avatar initials={person.initials} hue={person.avatarHue} size="sm" />
                <div>
                  <p className="text-sm font-bold text-ink">
                    {person.name}
                    {person.id === meId ? " (kamu)" : ""}
                  </p>
                  <p className="text-xs text-muted">{person.role}</p>
                </div>
              </li>
            ))}
          </ul>
          {attendees.length > 8 ? (
            <p className="mt-3 px-1 text-sm text-muted">
              + {attendees.length - 8} lainnya
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
