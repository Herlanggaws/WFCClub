"use client";

import Link from "next/link";
import { Avatar } from "./Avatar";
import type { User } from "@/lib/types";

interface PersonCardProps {
  person: User;
  isWfcToday?: boolean;
  href?: string;
}

export function PersonCard({
  person,
  isWfcToday,
  href = `/people/${person.id}`,
}: PersonCardProps) {
  return (
    <Link
      href={href}
      className="card-surface flex items-center gap-3.5 px-4 py-4 transition-transform active:scale-[0.99]"
    >
      <Avatar initials={person.initials} hue={person.avatarHue} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-ink">{person.name}</p>
        <p className="truncate text-sm text-muted">
          {person.role}
          {person.company ? ` · ${person.company}` : ""}
        </p>
        <p className="mt-1 truncate text-xs text-muted">
          {person.interests.slice(0, 3).join(" · ")}
        </p>
        {isWfcToday ? (
          <p className="mt-1.5 text-xs font-semibold text-live">
            ● WFC hari ini
          </p>
        ) : null}
      </div>
    </Link>
  );
}
