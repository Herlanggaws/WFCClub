"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, type AuthSession } from "../auth";
import { STORAGE_KEY, initialsFromName, todayIsoDate } from "../constants";
import {
  MOCK_PEOPLE,
  createMockEvents,
  createMockSessions,
} from "../mock";
import type {
  CommunityEvent,
  CurrentUserProfile,
  Interest,
  LookingFor,
  Role,
  WfcSession,
} from "../types";

interface CreateSessionInput {
  place: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  topic?: string;
}

interface CompleteOnboardingInput {
  name: string;
  role: Role;
  interests: Interest[];
  lookingFor: LookingFor[];
}

interface UserBucket {
  isOnboarded: boolean;
  currentUser: CurrentUserProfile | null;
  createdSessions: WfcSession[];
  joinedSessionIds: string[];
  rsvpedEventIds: string[];
}

interface AppStore {
  hydrated: boolean;
  session: AuthSession | null;
  isOnboarded: boolean;
  currentUser: CurrentUserProfile | null;
  sessions: WfcSession[];
  events: CommunityEvent[];
  people: typeof MOCK_PEOPLE;
  createdSessions: WfcSession[];
  joinedSessionIds: string[];
  rsvpedEventIds: string[];
  userBuckets: Record<string, UserBucket>;
  setHydrated: (value: boolean) => void;
  applySession: (session: AuthSession | null) => void;
  completeOnboarding: (input: CompleteOnboardingInput) => void;
  updateProfile: (patch: Partial<CurrentUserProfile>) => void;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  createSession: (input: CreateSessionInput) => string;
  rsvpEvent: (eventId: string) => void;
  cancelRsvp: (eventId: string) => void;
  signOut: () => Promise<void>;
  resetDemo: () => Promise<void>;
  rebuildDerivable: () => void;
  persistActiveBucket: () => void;
}

function emptyBucket(): UserBucket {
  return {
    isOnboarded: false,
    currentUser: null,
    createdSessions: [],
    joinedSessionIds: [],
    rsvpedEventIds: [],
  };
}

function withCurrentUserAsAttendee(
  sessions: WfcSession[],
  joinedSessionIds: string[],
  userId: string | null,
): WfcSession[] {
  if (!userId) return sessions;

  return sessions.map((session) => {
    const isJoined = joinedSessionIds.includes(session.id);
    const withoutMe = session.attendeeIds.filter((id) => id !== userId);
    return {
      ...session,
      attendeeIds: isJoined ? [...withoutMe, userId] : withoutMe,
    };
  });
}

function withCurrentUserAsEventAttendee(
  events: CommunityEvent[],
  rsvpedEventIds: string[],
  userId: string | null,
): CommunityEvent[] {
  if (!userId) return events;

  return events.map((event) => {
    const isRsvped = rsvpedEventIds.includes(event.id);
    const withoutMe = event.attendeeIds.filter((id) => id !== userId);
    return {
      ...event,
      attendeeIds: isRsvped ? [...withoutMe, userId] : withoutMe,
    };
  });
}

function buildSessions(
  createdSessions: WfcSession[],
  joinedSessionIds: string[],
  userId: string | null,
): WfcSession[] {
  const seed = createMockSessions();
  const merged = [...createdSessions, ...seed];
  return withCurrentUserAsAttendee(merged, joinedSessionIds, userId);
}

function buildEvents(
  rsvpedEventIds: string[],
  userId: string | null,
): CommunityEvent[] {
  return withCurrentUserAsEventAttendee(
    createMockEvents(),
    rsvpedEventIds,
    userId,
  );
}

function saveBucket(
  buckets: Record<string, UserBucket>,
  userId: string,
  bucket: UserBucket,
): Record<string, UserBucket> {
  return { ...buckets, [userId]: bucket };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      session: null,
      isOnboarded: false,
      currentUser: null,
      sessions: buildSessions([], [], null),
      events: buildEvents([], null),
      people: MOCK_PEOPLE,
      createdSessions: [],
      joinedSessionIds: [],
      rsvpedEventIds: [],
      userBuckets: {},

      setHydrated: (value) => set({ hydrated: value }),

      persistActiveBucket: () => {
        const {
          session,
          isOnboarded,
          currentUser,
          createdSessions,
          joinedSessionIds,
          rsvpedEventIds,
          userBuckets,
        } = get();
        if (!session) return;

        set({
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser,
            createdSessions,
            joinedSessionIds,
            rsvpedEventIds,
          }),
        });
      },

      applySession: (session) => {
        const { userBuckets } = get();

        if (!session) {
          set({
            session: null,
            isOnboarded: false,
            currentUser: null,
            createdSessions: [],
            joinedSessionIds: [],
            rsvpedEventIds: [],
            sessions: buildSessions([], [], null),
            events: buildEvents([], null),
          });
          return;
        }

        const bucket = userBuckets[session.userId] ?? emptyBucket();
        set({
          session,
          isOnboarded: bucket.isOnboarded,
          currentUser: bucket.currentUser,
          createdSessions: bucket.createdSessions,
          joinedSessionIds: bucket.joinedSessionIds,
          rsvpedEventIds: bucket.rsvpedEventIds,
          sessions: buildSessions(
            bucket.createdSessions,
            bucket.joinedSessionIds,
            session.userId,
          ),
          events: buildEvents(bucket.rsvpedEventIds, session.userId),
        });
      },

      rebuildDerivable: () => {
        const { createdSessions, joinedSessionIds, rsvpedEventIds, session } =
          get();
        const userId = session?.userId ?? null;
        set({
          sessions: buildSessions(createdSessions, joinedSessionIds, userId),
          events: buildEvents(rsvpedEventIds, userId),
        });
      },

      completeOnboarding: (input) => {
        const { session, userBuckets } = get();
        if (!session) return;

        const currentUser: CurrentUserProfile = {
          name: input.name.trim(),
          role: input.role,
          interests: input.interests,
          lookingFor: input.lookingFor,
          city: "Bandung",
          about: "",
          company: "",
          avatarHue: 175,
          initials: initialsFromName(input.name),
        };

        const bucket: UserBucket = {
          isOnboarded: true,
          currentUser,
          createdSessions: [],
          joinedSessionIds: [],
          rsvpedEventIds: [],
        };

        set({
          isOnboarded: true,
          currentUser,
          createdSessions: [],
          joinedSessionIds: [],
          rsvpedEventIds: [],
          sessions: buildSessions([], [], session.userId),
          events: buildEvents([], session.userId),
          userBuckets: saveBucket(userBuckets, session.userId, bucket),
        });
      },

      updateProfile: (patch) => {
        const { currentUser, session, userBuckets, createdSessions, joinedSessionIds, rsvpedEventIds, isOnboarded } =
          get();
        if (!currentUser || !session) return;

        const next = { ...currentUser, ...patch };
        if (patch.name) {
          next.initials = initialsFromName(patch.name);
        }

        set({
          currentUser: next,
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser: next,
            createdSessions,
            joinedSessionIds,
            rsvpedEventIds,
          }),
        });
      },

      joinSession: (sessionId) => {
        const {
          joinedSessionIds,
          createdSessions,
          session,
          userBuckets,
          currentUser,
          isOnboarded,
          rsvpedEventIds,
        } = get();
        if (!session || joinedSessionIds.includes(sessionId)) return;

        const nextJoined = [...joinedSessionIds, sessionId];
        set({
          joinedSessionIds: nextJoined,
          sessions: buildSessions(createdSessions, nextJoined, session.userId),
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser,
            createdSessions,
            joinedSessionIds: nextJoined,
            rsvpedEventIds,
          }),
        });
      },

      leaveSession: (sessionId) => {
        const {
          joinedSessionIds,
          createdSessions,
          session,
          userBuckets,
          currentUser,
          isOnboarded,
          rsvpedEventIds,
        } = get();
        if (!session) return;

        const nextJoined = joinedSessionIds.filter((id) => id !== sessionId);
        set({
          joinedSessionIds: nextJoined,
          sessions: buildSessions(createdSessions, nextJoined, session.userId),
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser,
            createdSessions,
            joinedSessionIds: nextJoined,
            rsvpedEventIds,
          }),
        });
      },

      createSession: (input) => {
        const {
          session,
          createdSessions,
          joinedSessionIds,
          userBuckets,
          currentUser,
          isOnboarded,
          rsvpedEventIds,
        } = get();
        if (!session) return "";

        const id = `s-${Date.now()}`;
        const wfcSession: WfcSession = {
          id,
          place: input.place.trim(),
          date: input.date || todayIsoDate(),
          startTime: input.startTime,
          endTime: input.endTime,
          note: input.note?.trim() || undefined,
          topic: input.topic?.trim() || undefined,
          attendeeIds: [session.userId],
          createdById: session.userId,
        };

        const nextCreated = [wfcSession, ...createdSessions];
        const nextJoined = [...joinedSessionIds, id];

        set({
          createdSessions: nextCreated,
          joinedSessionIds: nextJoined,
          sessions: buildSessions(nextCreated, nextJoined, session.userId),
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser,
            createdSessions: nextCreated,
            joinedSessionIds: nextJoined,
            rsvpedEventIds,
          }),
        });

        return id;
      },

      rsvpEvent: (eventId) => {
        const {
          rsvpedEventIds,
          session,
          userBuckets,
          currentUser,
          isOnboarded,
          createdSessions,
          joinedSessionIds,
        } = get();
        if (!session || rsvpedEventIds.includes(eventId)) return;

        const nextRsvp = [...rsvpedEventIds, eventId];
        set({
          rsvpedEventIds: nextRsvp,
          events: buildEvents(nextRsvp, session.userId),
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser,
            createdSessions,
            joinedSessionIds,
            rsvpedEventIds: nextRsvp,
          }),
        });
      },

      cancelRsvp: (eventId) => {
        const {
          rsvpedEventIds,
          session,
          userBuckets,
          currentUser,
          isOnboarded,
          createdSessions,
          joinedSessionIds,
        } = get();
        if (!session) return;

        const nextRsvp = rsvpedEventIds.filter((id) => id !== eventId);
        set({
          rsvpedEventIds: nextRsvp,
          events: buildEvents(nextRsvp, session.userId),
          userBuckets: saveBucket(userBuckets, session.userId, {
            isOnboarded,
            currentUser,
            createdSessions,
            joinedSessionIds,
            rsvpedEventIds: nextRsvp,
          }),
        });
      },

      signOut: async () => {
        get().persistActiveBucket();
        await auth.signOut();
        get().applySession(null);
      },

      resetDemo: async () => {
        const { session, userBuckets } = get();

        if (session) {
          await auth.deleteAccount(session.userId);
          const nextBuckets = { ...userBuckets };
          delete nextBuckets[session.userId];
          set({
            userBuckets: nextBuckets,
            session: null,
            isOnboarded: false,
            currentUser: null,
            createdSessions: [],
            joinedSessionIds: [],
            rsvpedEventIds: [],
            sessions: buildSessions([], [], null),
            events: buildEvents([], null),
            people: MOCK_PEOPLE,
          });
          return;
        }

        await auth.signOut();
        set({
          session: null,
          isOnboarded: false,
          currentUser: null,
          createdSessions: [],
          joinedSessionIds: [],
          rsvpedEventIds: [],
          sessions: buildSessions([], [], null),
          events: buildEvents([], null),
          people: MOCK_PEOPLE,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      partialize: (state) => ({
        userBuckets: state.userBuckets,
      }),
    },
  ),
);

export function useCurrentUserId() {
  return useAppStore((s) => s.session?.userId ?? null);
}

export function resolvePerson(
  people: typeof MOCK_PEOPLE,
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
