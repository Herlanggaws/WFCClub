import Link from "next/link";

export function CreateFab() {
  return (
    <Link
      href="/sessions/new"
      className="fixed bottom-[calc(var(--nav-height)+var(--safe-bottom)+14px)] left-1/2 z-50 flex h-[var(--fab-size)] w-[var(--fab-size)] -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-fab)] transition active:scale-95"
      aria-label="Saya lagi WFC"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
