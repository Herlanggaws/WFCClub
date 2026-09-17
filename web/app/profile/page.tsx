"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { PageHeader } from "@/components/PageHeader";
import {
  INTERESTS,
  LOOKING_FOR_OPTIONS,
  ROLES,
} from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";
import type { Interest, LookingFor, Role } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const session = useAppStore((s) => s.session);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const signOut = useAppStore((s) => s.signOut);
  const [isEditing, setIsEditing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAbout, setDraftAbout] = useState("");
  const [draftRole, setDraftRole] = useState<Role>("Other");

  useEffect(() => {
    if (!currentUser || isEditing) return;
    setDraftName(currentUser.name);
    setDraftAbout(currentUser.about);
    setDraftRole(currentUser.role);
  }, [currentUser, isEditing]);

  if (!currentUser) {
    return null;
  }

  function toggleInterest(value: Interest) {
    if (!currentUser) return;
    const next = currentUser.interests.includes(value)
      ? currentUser.interests.filter((item) => item !== value)
      : [...currentUser.interests, value];
    void updateProfile({ interests: next });
  }

  function toggleLookingFor(value: LookingFor) {
    if (!currentUser) return;
    const next = currentUser.lookingFor.includes(value)
      ? currentUser.lookingFor.filter((item) => item !== value)
      : [...currentUser.lookingFor, value];
    void updateProfile({ lookingFor: next });
  }

  async function handleToggleEdit() {
    const user = currentUser;
    if (!user) return;

    if (!isEditing) {
      setDraftName(user.name);
      setDraftAbout(user.about);
      setDraftRole(user.role);
      setIsEditing(true);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: draftName,
        about: draftAbout,
        role: draftRole,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="profile"
        subtitle="Siapa kamu, dan kenapa orang mau ngobrol."
        action={
          <button
            type="button"
            onClick={() => void handleToggleEdit()}
            disabled={isSaving}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
          >
            {isSaving ? "..." : isEditing ? "Selesai" : "Edit"}
          </button>
        }
      />

      <div className="px-4 py-4 animate-rise">
        <div className="card-surface px-5 py-6">
          <div className="flex items-center gap-4">
            <Avatar
              initials={currentUser.initials}
              hue={currentUser.avatarHue}
              size="xl"
            />
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border-0 bg-bg px-3 py-2 text-lg font-bold outline-none ring-accent focus:ring-2"
                />
              ) : (
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  {currentUser.name}
                </h2>
              )}
              <p className="mt-1 text-sm text-muted">📍 {currentUser.city}</p>
              {session?.email ? (
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  {session.email}
                </p>
              ) : null}
            </div>
          </div>

          <section className="mt-7">
            <h3 className="text-[15px] font-bold text-ink">Role</h3>
            {isEditing ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    selected={draftRole === role}
                    onClick={() => setDraftRole(role)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-muted">
                {currentUser.role}
                {currentUser.company ? ` · ${currentUser.company}` : ""}
              </p>
            )}
          </section>

          <section className="mt-7">
            <h3 className="text-[15px] font-bold text-ink">Tentang</h3>
            {isEditing ? (
              <textarea
                value={draftAbout}
                onChange={(event) => setDraftAbout(event.target.value)}
                rows={3}
                placeholder="Cerita singkat tentang kamu"
                className="mt-3 w-full resize-none rounded-[var(--radius-sm)] border-0 bg-bg px-4 py-3 text-sm outline-none ring-accent focus:ring-2"
              />
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {currentUser.about || "Belum ada bio."}
              </p>
            )}
          </section>

          <section className="mt-7">
            <h3 className="text-[15px] font-bold text-ink">Interests</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(isEditing ? INTERESTS : currentUser.interests).map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  selected={currentUser.interests.includes(interest)}
                  onClick={
                    isEditing ? () => toggleInterest(interest) : undefined
                  }
                />
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h3 className="text-[15px] font-bold text-ink">Looking for</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(isEditing ? LOOKING_FOR_OPTIONS : currentUser.lookingFor).map(
                (item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={currentUser.lookingFor.includes(item)}
                    onClick={
                      isEditing ? () => toggleLookingFor(item) : undefined
                    }
                  />
                ),
              )}
            </div>
          </section>

          <section className="mt-7 rounded-[var(--radius-sm)] bg-bg px-4 py-4">
            <h3 className="text-[15px] font-bold text-ink">Preferensi WFC</h3>
            <p className="mt-2 text-sm text-muted">Biasanya: Weekdays</p>
            <p className="text-sm text-muted">Jam: 10:00 – 17:00</p>
            <p className="text-sm text-muted">Tempat: Café & coworking</p>
          </section>
        </div>

        <button
          type="button"
          onClick={() => router.push("/change-password")}
          className="mt-6 w-full rounded-full border border-ink/10 bg-white px-5 py-3.5 text-sm font-bold text-ink"
        >
          Ubah password
        </button>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="mt-3 w-full rounded-full border border-ink/10 bg-white px-5 py-3.5 text-sm font-bold text-ink disabled:opacity-50"
        >
          {isSigningOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </div>
  );
}
