"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { CreateFab } from "./CreateFab";

interface MobileShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function MobileShell({ children, showNav = true }: MobileShellProps) {
  const pathname = usePathname();
  const showFab = showNav && pathname === "/home";
  const isOnboarding = pathname === "/onboarding";

  return (
    <div
      className={`mx-auto min-h-dvh w-full max-w-[var(--shell-max)] ${
        isOnboarding ? "bg-white" : "bg-bg"
      }`}
    >
      <div
        className="relative min-h-dvh"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <main
          className="min-h-dvh"
          style={{
            paddingBottom: showNav
              ? `calc(var(--nav-height) + var(--safe-bottom) + ${showFab ? "72px" : "20px"})`
              : "calc(var(--safe-bottom) + 16px)",
          }}
        >
          {children}
        </main>
        {showFab ? <CreateFab /> : null}
        {showNav ? <BottomNav /> : null}
      </div>
    </div>
  );
}
