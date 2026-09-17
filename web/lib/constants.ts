import type { Interest, LookingFor, Role } from "./types";

export const ROLES: Role[] = [
  "Developer",
  "Designer",
  "Founder",
  "Freelancer",
  "Creator",
  "Marketing",
  "Other",
];

export const INTERESTS: Interest[] = [
  "AI",
  "Startups",
  "Design",
  "Technology",
  "Business",
  "Finance",
  "Fitness",
  "SaaS",
  "Mobile",
  "Product",
  "Padel",
];

export const LOOKING_FOR_OPTIONS: LookingFor[] = [
  "Friends",
  "Networking",
  "Clients",
  "Collaborators",
  "Co-founders",
  "Talent",
  "Mentors",
  "Learning",
];

export const MIN_PASSWORD_LENGTH = 8;

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string): string {
  const today = todayIsoDate();
  if (isoDate === today) return "Hari ini";

  const tomorrow = addDaysIso(1);
  if (isoDate === tomorrow) return "Besok";

  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatPriceIdr(amount: number): string {
  if (amount === 0) return "Gratis";
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
