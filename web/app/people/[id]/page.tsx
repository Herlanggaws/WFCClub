"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { todayIsoDate } from "@/lib/constants";
import {
  resolveFriendshipWith,
  useAppStore,
  useCurrentUserId,
} from "@/lib/store/app-store";

export default function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const people = useAppStore((s) => s.people);
  const sessions = useAppStore((s) => s.sessions);
  const friendships = useAppStore((s) => s.friendships);
  const sendFriendRequest = useAppStore((s) => s.sendFriendRequest);
  const respondFriendRequest = useAppStore((s) => s.respondFriendRequest);
  const removeFriendship = useAppStore((s) => s.removeFriendship);
  const meId = useCurrentUserId();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  const person = people.find((item) => item.id === id);
  const today = todayIsoDate();
  const isSelf = meId === id;
  const friendship = meId
    ? resolveFriendshipWith(friendships, meId, id)
    : null;

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

  async function runAction(action: () => Promise<string | null>) {
    setIsActing(true);
    setActionError(null);
    try {
      const errorMessage = await action();
      if (errorMessage) setActionError(errorMessage);
    } finally {
      setIsActing(false);
    }
  }

  const isIncomingPending =
    friendship?.status === "pending" && friendship.addresseeId === meId;
  const isOutgoingPending =
    friendship?.status === "pending" && friendship.requesterId === meId;
  const isAccepted = friendship?.status === "accepted";

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

          {!isSelf && meId ? (
            <div className="mt-5 space-y-3">
              {isAccepted && friendship ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() =>
                    void runAction(() => removeFriendship(friendship.id))
                  }
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  {isActing ? "..." : "Hapus teman"}
                </button>
              ) : null}

              {isOutgoingPending && friendship ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() =>
                    void runAction(() => removeFriendship(friendship.id))
                  }
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  {isActing ? "..." : "Batalkan permintaan"}
                </button>
              ) : null}

              {isIncomingPending && friendship ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() =>
                      void runAction(() =>
                        respondFriendRequest(friendship.id, true),
                      )
                    }
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {isActing ? "..." : "Terima"}
                  </button>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() =>
                      void runAction(() =>
                        respondFriendRequest(friendship.id, false),
                      )
                    }
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              ) : null}

              {!friendship || friendship.status === "declined" ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() =>
                    void runAction(() => sendFriendRequest(person.id))
                  }
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {isActing ? "..." : "Tambah teman"}
                </button>
              ) : null}

              {isAccepted ? (
                <p className="text-center text-sm font-semibold text-live">
                  ✓ Teman
                </p>
              ) : null}

              {isOutgoingPending ? (
                <p className="text-center text-sm font-semibold text-muted">
                  Menunggu konfirmasi
                </p>
              ) : null}

              {actionError ? (
                <p className="rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </p>
              ) : null}
            </div>
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
