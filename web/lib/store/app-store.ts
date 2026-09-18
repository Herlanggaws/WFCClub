"use client";

import { create } from "zustand";
import { auth, type AuthSession } from "../auth";
import {
  cancelRsvpRow,
  completeProfileOnboarding,
  createSessionRow,
  ensureProfile,
  fetchEvents,
  fetchFriendships,
  fetchNotifications,
  fetchOnboardedPeople,
  fetchSessions,
  inviteToSessionRow,
  joinSessionRow,
  leaveSessionRow,
  markNotificationReadRow,
  profileToCurrentUser,
  removeFriendshipRow,
  respondFriendRequestRow,
  rsvpEventRow,
  sendFriendRequestRow,
  updateProfileRow,
  updateSessionRow,
  type CreateSessionInput,
  type CompleteOnboardingInput,
} from "../supabase/data";
import type {
  AppNotification,
  CommunityEvent,
  CurrentUserProfile,
  Friendship,
  User,
  WfcSession,
} from "../types";
import { formatDisplayDate, timesOverlap, isSessionEnded } from "../constants";

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
  friendships: Friendship[];
  notifications: AppNotification[];
  joinedSessionIds: string[];
  rsvpedEventIds: string[];
  setHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
  applySession: (session: AuthSession | null) => Promise<void>;
  refreshCommunity: () => Promise<void>;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<void>;
  updateProfile: (patch: Partial<CurrentUserProfile>) => Promise<void>;
  joinSession: (sessionId: string) => Promise<string | null>;
  leaveSession: (sessionId: string) => Promise<void>;
  createSession: (input: CreateSessionInput) => Promise<string>;
  updateSession: (
    sessionId: string,
    input: CreateSessionInput,
  ) => Promise<string | null>;
  inviteToSession: (
    sessionId: string,
    inviteeIds: string[],
  ) => Promise<string | null>;
  sendFriendRequest: (addresseeId: string) => Promise<string | null>;
  respondFriendRequest: (
    friendshipId: string,
    accept: boolean,
  ) => Promise<string | null>;
  removeFriendship: (friendshipId: string) => Promise<string | null>;
  markNotificationRead: (notificationId: string) => Promise<void>;
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
    friendships: [] as Friendship[],
    notifications: [] as AppNotification[],
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
  friendships: [],
  notifications: [],
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
      const [people, sessions, events, friendships, notifications] =
        await Promise.all([
          fetchOnboardedPeople(),
          fetchSessions(),
          fetchEvents(),
          fetchFriendships(session.userId),
          fetchNotifications(session.userId),
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
        friendships,
        notifications,
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
        friendships: [],
        notifications: [],
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

    const [people, sessions, events, friendships, notifications] =
      await Promise.all([
        fetchOnboardedPeople(),
        fetchSessions(),
        fetchEvents(),
        fetchFriendships(session.userId),
        fetchNotifications(session.userId),
      ]);

    set({
      people,
      sessions,
      events,
      friendships,
      notifications,
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
    const { session, joinedSessionIds, sessions } = get();
    if (!session || joinedSessionIds.includes(sessionId)) return null;

    const target = sessions.find((item) => item.id === sessionId);
    if (!target) return "Sesi tidak ditemukan.";

    const overlapping = sessions.find(
      (item) =>
        item.id !== target.id &&
        joinedSessionIds.includes(item.id) &&
        item.date === target.date &&
        timesOverlap(
          item.startTime,
          item.endTime,
          target.startTime,
          target.endTime,
        ),
    );

    if (overlapping) {
      return `Kamu sudah ikut sesi lain yang overlap (${overlapping.place} ${overlapping.startTime}–${overlapping.endTime}).`;
    }

    await joinSessionRow(sessionId, session.userId);
    await get().refreshCommunity();
    return null;
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

  updateSession: async (sessionId, input) => {
    const { session, sessions } = get();
    if (!session) return "Kamu perlu masuk dulu.";

    const existing = sessions.find((item) => item.id === sessionId);
    if (!existing) return "Sesi tidak ditemukan.";
    if (existing.createdById !== session.userId) {
      return "Hanya pembuat sesi yang bisa edit.";
    }
    if (isSessionEnded(existing.date, existing.endTime)) {
      return "Sesi yang sudah selesai tidak bisa diedit.";
    }

    await updateSessionRow(sessionId, session.userId, input);
    await get().refreshCommunity();
    return null;
  },

  inviteToSession: async (sessionId, inviteeIds) => {
    const { session, currentUser, sessions } = get();
    if (!session || !currentUser) return "Kamu perlu masuk dulu.";

    const target = sessions.find((item) => item.id === sessionId);
    if (!target) return "Sesi tidak ditemukan.";

    try {
      await inviteToSessionRow({
        sessionId,
        inviterId: session.userId,
        inviterName: currentUser.name,
        inviteeIds,
        place: target.place,
        dateLabel: formatDisplayDate(target.date),
        startTime: target.startTime,
        endTime: target.endTime,
      });
      await get().refreshCommunity();
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Gagal mengirim undangan.";
    }
  },

  sendFriendRequest: async (addresseeId) => {
    const { session, currentUser } = get();
    if (!session || !currentUser) return "Kamu perlu masuk dulu.";

    try {
      await sendFriendRequestRow(
        session.userId,
        addresseeId,
        currentUser.name,
      );
      await get().refreshCommunity();
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Gagal mengirim permintaan teman.";
    }
  },

  respondFriendRequest: async (friendshipId, accept) => {
    const { session, currentUser } = get();
    if (!session || !currentUser) return "Kamu perlu masuk dulu.";

    try {
      await respondFriendRequestRow(
        friendshipId,
        session.userId,
        accept,
        currentUser.name,
      );
      await get().refreshCommunity();
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Gagal memproses permintaan teman.";
    }
  },

  removeFriendship: async (friendshipId) => {
    const { session } = get();
    if (!session) return "Kamu perlu masuk dulu.";

    try {
      await removeFriendshipRow(friendshipId, session.userId);
      await get().refreshCommunity();
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Gagal menghapus pertemanan.";
    }
  },

  markNotificationRead: async (notificationId) => {
    const { session, notifications } = get();
    if (!session) return;

    const target = notifications.find((item) => item.id === notificationId);
    if (!target || target.readAt) return;

    set({
      notifications: notifications.map((item) =>
        item.id === notificationId
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    });

    try {
      await markNotificationReadRow(notificationId, session.userId);
    } catch {
      await get().refreshCommunity();
    }
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

export function friendIdForUser(
  friendship: Friendship,
  userId: string,
): string {
  return friendship.requesterId === userId
    ? friendship.addresseeId
    : friendship.requesterId;
}

export function resolveFriendshipWith(
  friendships: Friendship[],
  userId: string,
  otherUserId: string,
): Friendship | null {
  return (
    friendships.find(
      (item) =>
        (item.requesterId === userId && item.addresseeId === otherUserId) ||
        (item.requesterId === otherUserId && item.addresseeId === userId),
    ) ?? null
  );
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
