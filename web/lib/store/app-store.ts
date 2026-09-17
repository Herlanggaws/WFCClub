"use client";

import { create } from "zustand";
import { auth, type AuthSession } from "../auth";
import {
  cancelRsvpRow,
  completeProfileOnboarding,
  createSessionRow,
  ensureProfile,
  fetchEvents,
  fetchOnboardedPeople,
  fetchSessions,
  joinSessionRow,
  leaveSessionRow,
  profileToCurrentUser,
  rsvpEventRow,
  updateProfileRow,
  type CreateSessionInput,
  type CompleteOnboardingInput,
} from "../supabase/data";
import type {
  CommunityEvent,
  CurrentUserProfile,
  User,
  WfcSession,
} from "../types";

interface AppStore {
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  session: AuthSession | null;
  isOnboarded: boolean;
  currentUser: CurrentUserProfile | null;
  sessions: WfcSession[];
  events: CommunityEvent[];
  people: User[];
  joinedSessionIds: string[];
  rsvpedEventIds: string[];
  setHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
  applySession: (session: AuthSession | null) => Promise<void>;
  refreshCommunity: () => Promise<void>;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<void>;
  updateProfile: (patch: Partial<CurrentUserProfile>) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  createSession: (input: CreateSessionInput) => Promise<string>;
  rsvpEvent: (eventId: string) => Promise<void>;
  cancelRsvp: (eventId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

function deriveJoined(sessions: WfcSession[], userId: string | null): string[] {
  if (!userId) return [];
  return sessions
    .filter((session) => session.attendeeIds.includes(userId))
    .map((session) => session.id);
}

function deriveRsvped(events: CommunityEvent[], userId: string | null): string[] {
  if (!userId) return [];
  return events
    .filter((event) => event.attendeeIds.includes(userId))
    .map((event) => event.id);
}

function clearUserState() {
  return {
    session: null as AuthSession | null,
    isOnboarded: false,
    currentUser: null as CurrentUserProfile | null,
    sessions: [] as WfcSession[],
    events: [] as CommunityEvent[],
    people: [] as User[],
    joinedSessionIds: [] as string[],
    rsvpedEventIds: [] as string[],
    error: null as string | null,
  };
}

export const useAppStore = create<AppStore>()((set, get) => ({
  hydrated: false,
  loading: false,
  session: null,
  isOnboarded: false,
  currentUser: null,
  sessions: [],
  events: [],
  people: [],
  joinedSessionIds: [],
  rsvpedEventIds: [],
  error: null,

  setHydrated: (value) => set({ hydrated: value }),

  bootstrap: async () => {
    const nextSession = await auth.getSession();
    await get().applySession(nextSession);
    set({ hydrated: true });
  },

  applySession: async (session) => {
    if (!session) {
      set(clearUserState());
      return;
    }

    set({ loading: true, error: null, session });

    try {
      const profile = await ensureProfile(session.userId);
      const [people, sessions, events] = await Promise.all([
        fetchOnboardedPeople(),
        fetchSessions(),
        fetchEvents(),
      ]);

      set({
        session,
        isOnboarded: profile.is_onboarded,
        currentUser: profile.is_onboarded
          ? profileToCurrentUser(profile)
          : null,
        people,
        sessions,
        events,
        joinedSessionIds: deriveJoined(sessions, session.userId),
        rsvpedEventIds: deriveRsvped(events, session.userId),
        loading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat data.";
      set({
        session,
        isOnboarded: false,
        currentUser: null,
        sessions: [],
        events: [],
        people: [],
        joinedSessionIds: [],
        rsvpedEventIds: [],
        loading: false,
        error: message,
      });
      throw error;
    }
  },

  refreshCommunity: async () => {
    const { session } = get();
    if (!session) return;

    const [people, sessions, events] = await Promise.all([
      fetchOnboardedPeople(),
      fetchSessions(),
      fetchEvents(),
    ]);

    set({
      people,
      sessions,
      events,
      joinedSessionIds: deriveJoined(sessions, session.userId),
      rsvpedEventIds: deriveRsvped(events, session.userId),
    });
  },

  completeOnboarding: async (input) => {
    const { session } = get();
    if (!session) return;

    const currentUser = await completeProfileOnboarding(session.userId, input);
    await get().refreshCommunity();
    set({
      isOnboarded: true,
      currentUser,
    });
  },

  updateProfile: async (patch) => {
    const { session, currentUser } = get();
    if (!session || !currentUser) return;

    const next = await updateProfileRow(session.userId, patch);
    set({ currentUser: next });
    await get().refreshCommunity();
  },

  joinSession: async (sessionId) => {
    const { session, joinedSessionIds } = get();
    if (!session || joinedSessionIds.includes(sessionId)) return;

    await joinSessionRow(sessionId, session.userId);
    await get().refreshCommunity();
  },

  leaveSession: async (sessionId) => {
    const { session } = get();
    if (!session) return;

    await leaveSessionRow(sessionId, session.userId);
    await get().refreshCommunity();
  },

  createSession: async (input) => {
    const { session } = get();
    if (!session) return "";

    const created = await createSessionRow(session.userId, input);
    await get().refreshCommunity();
    return created.id;
  },

  rsvpEvent: async (eventId) => {
    const { session, rsvpedEventIds } = get();
    if (!session || rsvpedEventIds.includes(eventId)) return;

    await rsvpEventRow(eventId, session.userId);
    await get().refreshCommunity();
  },

  cancelRsvp: async (eventId) => {
    const { session } = get();
    if (!session) return;

    await cancelRsvpRow(eventId, session.userId);
    await get().refreshCommunity();
  },

  signOut: async () => {
    await auth.signOut();
    set(clearUserState());
  },
}));

export function useCurrentUserId() {
  return useAppStore((s) => s.session?.userId ?? null);
}

export function resolvePerson(
  people: User[],
  currentUser: CurrentUserProfile | null,
  id: string,
  currentUserId?: string | null,
) {
  if (currentUserId && id === currentUserId && currentUser) {
    return {
      id: currentUserId,
      name: currentUser.name,
      role: currentUser.role,
      company: currentUser.company || undefined,
      city: currentUser.city,
      about: currentUser.about || undefined,
      interests: currentUser.interests,
      lookingFor: currentUser.lookingFor,
      avatarHue: currentUser.avatarHue,
      initials: currentUser.initials,
    };
  }

  return people.find((person) => person.id === id) ?? null;
}
