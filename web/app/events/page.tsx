"use client";

import { EmptyState } from "@/components/EmptyState";
import { EventRow } from "@/components/EventRow";
import { PageHeader } from "@/components/PageHeader";
import { todayIsoDate } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function EventsPage() {
  const events = useAppStore((s) => s.events);
  const rsvpedEventIds = useAppStore((s) => s.rsvpedEventIds);
  const today = todayIsoDate();

  const upcoming = [...events]
    .filter((event) => event.date >= today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
    );

  return (
    <div>
      <PageHeader
        title="events"
        subtitle="Aktivitas komunitas yang worth ditemuin."
      />

      <div className="px-4 py-4">
        <h2 className="mb-3 px-1 text-[15px] font-bold text-ink">
          Minggu ini & mendatang
        </h2>

        {upcoming.length === 0 ? (
          <EmptyState
            title="Belum ada event"
            description="Event komunitas akan muncul di sini."
          />
        ) : (
          <div className="space-y-3.5 animate-rise">
            {upcoming.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                isRsvped={rsvpedEventIds.includes(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
