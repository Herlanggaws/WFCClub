"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useAppStore } from "@/lib/store/app-store";
import type { AppNotification } from "@/lib/types";

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  async function handleOpen(notification: AppNotification) {
    if (!notification.readAt) {
      void markNotificationRead(notification.id);
    }

    const href = hrefForNotification(notification);
    if (href) router.push(href);
  }

  return (
    <div>
      <PageHeader title="notifikasi" backHref="/home" />

      <div className="px-4 py-4 animate-rise">
        {notifications.length === 0 ? (
          <EmptyState
            title="Belum ada notifikasi"
            description="Undangan WFC dan permintaan teman akan muncul di sini."
          />
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => {
              const isUnread = !notification.readAt;
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleOpen(notification)}
                    className={`card-surface w-full px-4 py-4 text-left transition active:scale-[0.99] ${
                      isUnread ? "ring-1 ring-accent/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          isUnread ? "bg-accent" : "bg-transparent"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink">{notification.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {notification.body}
                        </p>
                        <p className="mt-2 text-[12px] font-medium text-muted">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Butuh lihat event komunitas?{" "}
          <Link href="/events" className="font-semibold text-accent">
            Ke Events
          </Link>
        </p>
      </div>
    </div>
  );
}

function hrefForNotification(notification: AppNotification): string | null {
  if (
    notification.type === "session_invite" &&
    notification.targetType === "session" &&
    notification.targetId
  ) {
    return `/sessions/${notification.targetId}`;
  }

  if (
    (notification.type === "friend_request" ||
      notification.type === "friend_accepted") &&
    notification.actorId
  ) {
    return `/people/${notification.actorId}`;
  }

  if (notification.targetType === "person" && notification.targetId) {
    return `/people/${notification.targetId}`;
  }

  return null;
}

function formatRelativeTime(iso: string): string {
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) return "";

  const diffMs = Date.now() - created;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;

  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
