"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { useAppStore } from "@/lib/store/app-store";
import { MobileShell } from "./MobileShell";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const AUTH_ONLY_PREFIXES = ["/onboarding"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AppGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAppStore((s) => s.hydrated);
  const session = useAppStore((s) => s.session);
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const applySession = useAppStore((s) => s.applySession);

  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      await useAppStore.persist.rehydrate();
      if (cancelled) return;

      const nextSession = await auth.getSession();
      if (cancelled) return;

      applySession(nextSession);
      useAppStore.getState().rebuildDerivable();
      setHydrated(true);
    }

    void rehydrate();

    return () => {
      cancelled = true;
    };
  }, [applySession, setHydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const isPublic = matchesPrefix(pathname, PUBLIC_PREFIXES);
    const isAuthOnly = matchesPrefix(pathname, AUTH_ONLY_PREFIXES);
    const isPasswordReset = matchesPrefix(pathname, ["/reset-password"]);

    // Recovery link establishes a session; keep user on reset form.
    if (isPasswordReset) return;

    if (!session) {
      if (!isPublic) {
        router.replace("/login");
      }
      return;
    }

    if (!isOnboarded) {
      if (!isAuthOnly) {
        router.replace("/onboarding");
      }
      return;
    }

    if (isPublic || isAuthOnly || pathname === "/") {
      router.replace("/home");
    }
  }, [hydrated, session, isOnboarded, pathname, router]);

  if (!hydrated) {
    return (
      <MobileShell showNav={false}>
        <div className="relative flex min-h-dvh flex-col bg-white px-6">
          <p className="pt-[18vh] text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink animate-rise">
            almost there...
          </p>
          <div className="flex flex-1 items-center justify-center pb-[18vh]">
            <div
              className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#d1d1d6] border-t-[#8e8e93]"
              aria-label="loading"
            />
          </div>
        </div>
      </MobileShell>
    );
  }

  const hideNav =
    pathname === "/onboarding" ||
    pathname === "/change-password" ||
    matchesPrefix(pathname, PUBLIC_PREFIXES) ||
    pathname.startsWith("/sessions") ||
    pathname.startsWith("/people/") ||
    (pathname.startsWith("/events/") && pathname !== "/events");

  return <MobileShell showNav={!hideNav}>{children}</MobileShell>;
}
