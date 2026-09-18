import type {
  AppNotification,
  CommunityEvent,
  CurrentUserProfile,
  Friendship,
  FriendshipStatus,
  Interest,
  LookingFor,
  NotificationTargetType,
  NotificationType,
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

export async function updateSessionRow(
  sessionId: string,
  userId: string,
  input: CreateSessionInput,
): Promise<WfcSession> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wfc_sessions")
    .update({
      place: input.place.trim(),
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      note: input.note?.trim() || null,
      topic: input.topic?.trim() || null,
    })
    .eq("id", sessionId)
    .eq("created_by", userId)
    .select("*, session_attendees(user_id)")
    .single();

  if (error) throw error;
  return mapSession(data as SessionRow);
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

const FEEDBACK_IMAGE_BUCKET = "feedback-images";
const FEEDBACK_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const FEEDBACK_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class FeedbackImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackImageError";
  }
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

async function uploadFeedbackImage(
  userId: string,
  file: File,
): Promise<{ path: string; publicUrl: string }> {
  if (!FEEDBACK_IMAGE_MIME_TYPES.has(file.type)) {
    throw new FeedbackImageError(
      "Format gambar harus JPEG, PNG, atau WebP.",
    );
  }
  if (file.size > FEEDBACK_IMAGE_MAX_BYTES) {
    throw new FeedbackImageError("Ukuran gambar maksimal 5MB.");
  }

  const supabase = getSupabaseBrowserClient();
  const path = `${userId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;
  const { error } = await supabase.storage
    .from(FEEDBACK_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new FeedbackImageError("Gagal upload gambar. Coba lagi.");
  }

  const { data } = supabase.storage
    .from(FEEDBACK_IMAGE_BUCKET)
    .getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}

export async function createFeedbackRow(input: {
  userId: string;
  category: FeedbackCategory;
  message: string;
  imageFile?: File | null;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  let imageUrl: string | null = null;
  let uploadedPath: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadFeedbackImage(input.userId, input.imageFile);
    imageUrl = uploaded.publicUrl;
    uploadedPath = uploaded.path;
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: input.userId,
    category: input.category,
    message: input.message.trim(),
    image_url: imageUrl,
  });

  if (error) {
    if (uploadedPath) {
      try {
        await supabase.storage
          .from(FEEDBACK_IMAGE_BUCKET)
          .remove([uploadedPath]);
      } catch {
        // Best-effort cleanup; still surface the insert failure.
      }
    }
    throw error;
  }
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
}

interface NotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  target_type: NotificationTargetType | null;
  target_id: string | null;
  read_at: string | null;
  created_at: string;
}

function mapFriendship(row: FriendshipRow): Friendship {
  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    actorId: row.actor_id,
    type: row.type,
    title: row.title,
    body: row.body,
    targetType: row.target_type,
    targetId: row.target_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function fetchFriendships(userId: string): Promise<Friendship[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as FriendshipRow[]).map(mapFriendship);
}

export async function sendFriendRequestRow(
  requesterId: string,
  addresseeId: string,
  requesterName: string,
): Promise<Friendship> {
  if (requesterId === addresseeId) {
    throw new Error("Tidak bisa menambah diri sendiri sebagai teman.");
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("friendships")
    .insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: "pending",
    })
    .select("id, requester_id, addressee_id, status, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Permintaan teman sudah ada.");
    }
    throw error;
  }

  const { error: notifError } = await supabase.from("notifications").insert({
    recipient_id: addresseeId,
    actor_id: requesterId,
    type: "friend_request",
    title: "Permintaan teman",
    body: `${requesterName} ingin berteman denganmu.`,
    target_type: "person",
    target_id: requesterId,
  });

  if (notifError) throw notifError;
  return mapFriendship(data as FriendshipRow);
}

export async function respondFriendRequestRow(
  friendshipId: string,
  userId: string,
  accept: boolean,
  addresseeName: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const nextStatus: FriendshipStatus = accept ? "accepted" : "declined";

  const { data, error } = await supabase
    .from("friendships")
    .update({ status: nextStatus })
    .eq("id", friendshipId)
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .select("id, requester_id, addressee_id, status, created_at")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Permintaan teman tidak ditemukan.");

  if (accept) {
    const { error: notifError } = await supabase.from("notifications").insert({
      recipient_id: data.requester_id,
      actor_id: userId,
      type: "friend_accepted",
      title: "Teman baru",
      body: `${addresseeName} menerima permintaan temanmu.`,
      target_type: "person",
      target_id: userId,
    });
    if (notifError) throw notifError;
  }
}

export async function removeFriendshipRow(
  friendshipId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (error) throw error;
}

export async function fetchSessionInviteeIds(
  sessionId: string,
): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("session_invites")
    .select("invitee_id")
    .eq("session_id", sessionId);

  if (error) throw error;
  return ((data ?? []) as { invitee_id: string }[]).map(
    (row) => row.invitee_id,
  );
}

export async function inviteToSessionRow(input: {
  sessionId: string;
  inviterId: string;
  inviterName: string;
  inviteeIds: string[];
  place: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
}): Promise<number> {
  const uniqueIds = [...new Set(input.inviteeIds)].filter(
    (id) => id !== input.inviterId,
  );
  if (uniqueIds.length === 0) return 0;

  const supabase = getSupabaseBrowserClient();
  const inviteRows = uniqueIds.map((inviteeId) => ({
    session_id: input.sessionId,
    inviter_id: input.inviterId,
    invitee_id: inviteeId,
  }));

  const { data, error } = await supabase
    .from("session_invites")
    .upsert(inviteRows, {
      onConflict: "session_id,invitee_id",
      ignoreDuplicates: true,
    })
    .select("invitee_id");

  if (error) throw error;

  const insertedIds = ((data ?? []) as { invitee_id: string }[]).map(
    (row) => row.invitee_id,
  );
  if (insertedIds.length === 0) return 0;

  const notificationRows = insertedIds.map((inviteeId) => ({
    recipient_id: inviteeId,
    actor_id: input.inviterId,
    type: "session_invite" as const,
    title: "Undangan WFC",
    body: `${input.inviterName} mengundangmu ke ${input.place} · ${input.dateLabel} ${input.startTime}–${input.endTime}`,
    target_type: "session" as const,
    target_id: input.sessionId,
  }));

  const { error: notifError } = await supabase
    .from("notifications")
    .insert(notificationRows);

  if (notifError) throw notifError;
  return insertedIds.length;
}

export async function fetchNotifications(
  userId: string,
): Promise<AppNotification[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, recipient_id, actor_id, type, title, body, target_type, target_id, read_at, created_at",
    )
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(mapNotification);
}

export async function markNotificationReadRow(
  notificationId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) throw error;
}
