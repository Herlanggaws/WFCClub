"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  INTERESTS,
  LOOKING_FOR_OPTIONS,
  ROLES,
} from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";
import type { Interest, LookingFor, Role } from "@/lib/types";

const STEPS = ["name", "role", "interests", "intent", "done"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [lookingFor, setLookingFor] = useState<LookingFor[]>([]);

  const step = STEPS[stepIndex];

  useEffect(() => {
    if (!session) return;
    if (step !== "done" || !role) return;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          await completeOnboarding({
            name,
            role,
            interests,
            lookingFor,
          });
          if (!cancelled) router.replace("/home");
        } catch {
          if (!cancelled) setStepIndex(STEPS.indexOf("intent"));
        }
      })();
    }, 1400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    session,
    step,
    role,
    name,
    interests,
    lookingFor,
    completeOnboarding,
    router,
  ]);

  function toggleInterest(value: Interest) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function toggleLookingFor(value: LookingFor) {
    setLookingFor((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function canContinue() {
    if (step === "name") return name.trim().length >= 2;
    if (step === "role") return role !== null;
    if (step === "interests") return interests.length >= 1;
    if (step === "intent") return lookingFor.length >= 1;
    return false;
  }

  function handleNext() {
    if (!canContinue()) return;
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  function handleBack() {
    if (stepIndex === 0 || step === "done") return;
    setStepIndex((index) => index - 1);
  }

  if (step === "done") {
    return (
      <div className="relative flex min-h-dvh flex-col bg-white px-6">
        <p className="pt-[18vh] text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink animate-rise">
          almost there...
        </p>
        <div className="flex flex-1 items-center justify-center pb-[18vh]">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-white px-6 pb-10 pt-4">
      {stepIndex > 0 ? (
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-muted"
          aria-label="back"
        >
          ←
        </button>
      ) : null}

      <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col items-center pt-[12vh] animate-rise">
        {step === "name" ? (
          <>
            <h1 className="text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink">
              what&apos;s your name?
            </h1>
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleNext();
              }}
              placeholder="your name"
              className="mt-10 w-full rounded-full border-0 bg-[#f7f3ea] px-6 py-4 text-center text-lg font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/70 focus:ring-2 focus:ring-accent/30"
            />
            <p className="mt-4 max-w-[280px] text-center text-[13px] leading-relaxed text-muted">
              this is how other people will see you in the community.
            </p>
          </>
        ) : null}

        {step === "role" ? (
          <>
            <h1 className="text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink">
              what do you do?
            </h1>
            <p className="mt-3 text-center text-[13px] text-muted">
              pick the closest one
            </p>
            <div className="mt-10 flex w-full flex-wrap justify-center gap-2.5">
              {ROLES.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  selected={role === item}
                  onClick={() => setRole(item)}
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "interests" ? (
          <>
            <h1 className="text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink">
              what are you into?
            </h1>
            <p className="mt-3 text-center text-[13px] text-muted">
              pick one or more
            </p>
            <div className="mt-10 flex w-full flex-wrap justify-center gap-2.5">
              {INTERESTS.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  selected={interests.includes(item)}
                  onClick={() => toggleInterest(item)}
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "intent" ? (
          <>
            <h1 className="text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink">
              what are you looking for?
            </h1>
            <p className="mt-3 text-center text-[13px] text-muted">
              you can always change it later
            </p>
            <div className="mt-10 flex w-full flex-wrap justify-center gap-2.5">
              {LOOKING_FOR_OPTIONS.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  selected={lookingFor.includes(item)}
                  onClick={() => toggleLookingFor(item)}
                />
              ))}
            </div>
          </>
        ) : null}

        <button
          type="button"
          disabled={!canContinue()}
          onClick={handleNext}
          className="mt-12 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-10 py-3.5 text-[17px] font-bold lowercase text-white transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
        >
          next
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function SelectChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold lowercase transition-colors ${
        selected
          ? "bg-accent text-white"
          : "bg-[#f7f3ea] text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <div
      className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#d1d1d6] border-t-[#8e8e93]"
      aria-label="loading"
    />
  );
}
