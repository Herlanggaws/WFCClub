"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/people", label: "People", icon: PeopleIcon },
  { href: "/events", label: "Events", icon: EventsIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[var(--shell-max)] -translate-x-1/2 border-t border-line/80 bg-surface"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Navigasi utama"
    >
      <ul className="grid h-[var(--nav-height)] grid-cols-4">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  isActive ? "text-ink" : "text-muted"
                }`}
                aria-label={tab.label}
              >
                <Icon active={isActive} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
      />
      <path
        d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
        strokeLinecap="round"
      />
      <path
        d="M16.5 7.5v5M14 10h5"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function EventsIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
      />
      <path
        d="M8 3.5v3M16 3.5v3M3.5 10h17"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M5 19.5c1.2-3.2 3.6-4.8 7-4.8s5.8 1.6 7 4.8"
        stroke="currentColor"
        strokeWidth={active ? 2.1 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}
