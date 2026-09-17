import type {
  CommunityEvent,
  CurrentUserProfile,
  Interest,
  LookingFor,
  Role,
  User,
  WfcSession,
} from "../types";
import { initialsFromName } from "../constants";
import { getSupabaseBrowserClient } from "./client";

export interface ProfileRow {
  id: string;
  name: string;
  role: string | null;
  company: string;
  city: string;
  about: string;
  interests: string[] | null;
  looking_for: string[] | null;
  avatar_hue: number;
  initials: string;
  is_onboarded: boolean;
}

interface SessionRow {
  id: string;
  place: string;
  date: string;
  start_time: string;
  end_time: string;
  note: string | null;
  topic: string | null;
  created_by: string;
  session_attendees: { user_id: string }[] | null;
}

interface EventRow {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  place: string;
  description: string;
  expectations: string[] | null;
  capacity: number;
  price_idr: number;
  audience: string | null;
  event_rsvps: { user_id: string }[] | null;
}

function asRole(value: string | null): Role {
  return (value as Role) || "Other";
}

function asInterests(value: string[] | null): Interest[] {
  return (value ?? []) as Interest[];
}

function asLookingFor(value: string[] | null): LookingFor[] {
  return (value ?? []) as LookingFor[];
}

export function profileToCurrentUser(row: ProfileRow): CurrentUserProfile {
  return {
    name: row.name,
    role: asRole(row.role),
    company: row.company,
    city: row.city,
    about: row.about,
    interests: asInterests(row.interests),
    lookingFor: asLookingFor(row.looking_for),
    avatarHue: row.avatar_hue,
    initials: row.initials,
  };
}

export function profileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    role: asRole(row.role),
    company: row.company || undefined,
    city: row.city,
    about: row.about || undefined,
    interests: asInterests(row.interests),
    lookingFor: asLookingFor(row.looking_for),
    avatarHue: row.avatar_hue,
    initials: row.initials,
  };
}

function mapSession(row: SessionRow): WfcSession {
  return {
    id: row.id,
    place: row.place,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    note: row.note || undefined,
    topic: row.topic || undefined,
    createdById: row.created_by,
    attendeeIds: (row.session_attendees ?? []).map((item) => item.user_id),
  };
}

function mapEvent(row: EventRow): CommunityEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    place: row.place,
    description: row.description,
    expectations: row.expectations ?? [],
    capacity: row.capacity,
    priceIdr: row.price_idr,
    audience: row.audience || undefined,
    attendeeIds: (row.event_rsvps ?? []).map((item) => item.user_id),
  };
}

export async function ensureProfile(userId: string): Promise<ProfileRow> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as ProfileRow;

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return created as ProfileRow;
}

export async function fetchOnboardedPeople(): Promise<User[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_onboarded", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(profileToUser);
}

export async function fetchSessions(): Promise<WfcSession[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wfc_sessions")
    .select("*, session_attendees(user_id)")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as SessionRow[]).map(mapSession);
}

export async function fetchEvents(): Promise<CommunityEvent[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("community_events")
    .select("*, event_rsvps(user_id)")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as EventRow[]).map(mapEvent);
}

export interface CompleteOnboardingInput {
  name: string;
  role: Role;
  interests: Interest[];
  lookingFor: LookingFor[];
}

export async function completeProfileOnboarding(
  userId: string,
  input: CompleteOnboardingInput,
): Promise<CurrentUserProfile> {
  const supabase = getSupabaseBrowserClient();
  const name = input.name.trim();
  const payload = {
    name,
    role: input.role,
    interests: input.interests,
    looking_for: input.lookingFor,
    city: "Bandung",
    about: "",
    company: "",
    avatar_hue: 175,
    initials: initialsFromName(name),
    is_onboarded: true,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...payload })
    .select("*")
    .single();

  if (error) throw error;
  return profileToCurrentUser(data as ProfileRow);
}

export async function updateProfileRow(
  userId: string,
  patch: Partial<CurrentUserProfile>,
): Promise<CurrentUserProfile> {
  const supabase = getSupabaseBrowserClient();
  const payload: Record<string, unknown> = {};

  if (patch.name !== undefined) {
    payload.name = patch.name.trim();
    payload.initials = initialsFromName(patch.name);
  }
  if (patch.role !== undefined) payload.role = patch.role;
  if (patch.company !== undefined) payload.company = patch.company;
  if (patch.city !== undefined) payload.city = patch.city;
  if (patch.about !== undefined) payload.about = patch.about;
  if (patch.interests !== undefined) payload.interests = patch.interests;
  if (patch.lookingFor !== undefined) payload.looking_for = patch.lookingFor;
  if (patch.avatarHue !== undefined) payload.avatar_hue = patch.avatarHue;
  if (patch.initials !== undefined) payload.initials = patch.initials;

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return profileToCurrentUser(data as ProfileRow);
}

export interface CreateSessionInput {
  place: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  topic?: string;
}

export async function createSessionRow(
  userId: string,
  input: CreateSessionInput,
): Promise<WfcSession> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wfc_sessions")
    .insert({
      place: input.place.trim(),
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      note: input.note?.trim() || null,
      topic: input.topic?.trim() || null,
      created_by: userId,
    })
    .select("*, session_attendees(user_id)")
    .single();

  if (error) throw error;

  const { error: joinError } = await supabase.from("session_attendees").insert({
    session_id: data.id,
    user_id: userId,
  });

  if (joinError) throw joinError;

  const session = mapSession(data as SessionRow);
  if (!session.attendeeIds.includes(userId)) {
    session.attendeeIds = [...session.attendeeIds, userId];
  }
  return session;
}

export async function joinSessionRow(
  sessionId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("session_attendees").insert({
    session_id: sessionId,
    user_id: userId,
  });
  if (error && error.code !== "23505") throw error;
}

export async function leaveSessionRow(
  sessionId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("session_attendees")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function rsvpEventRow(
  eventId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("event_rsvps").insert({
    event_id: eventId,
    user_id: userId,
  });
  if (error && error.code !== "23505") throw error;
}

export async function cancelRsvpRow(
  eventId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);
  if (error) throw error;
}

export type FeedbackCategory = "bug" | "saran" | "lainnya";

export async function createFeedbackRow(input: {
  userId: string;
  category: FeedbackCategory;
  message: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("feedback").insert({
    user_id: input.userId,
    category: input.category,
    message: input.message.trim(),
  });
  if (error) throw error;
}
