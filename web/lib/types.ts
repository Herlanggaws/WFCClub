export type Role =
  | "Developer"
  | "Designer"
  | "Founder"
  | "Freelancer"
  | "Creator"
  | "Marketing"
  | "Other";

export type LookingFor =
  | "Friends"
  | "Networking"
  | "Clients"
  | "Collaborators"
  | "Co-founders"
  | "Talent"
  | "Mentors"
  | "Learning";

export type Interest =
  | "AI"
  | "Startups"
  | "Design"
  | "Technology"
  | "Business"
  | "Finance"
  | "Fitness"
  | "SaaS"
  | "Mobile"
  | "Product"
  | "Padel";

export interface User {
  id: string;
  name: string;
  role: Role;
  company?: string;
  city: string;
  about?: string;
  interests: Interest[];
  lookingFor: LookingFor[];
  avatarHue: number;
  initials: string;
}

export interface WfcSession {
  id: string;
  place: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  topic?: string;
  attendeeIds: string[];
  createdById: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  place: string;
  description: string;
  expectations: string[];
  capacity: number;
  attendeeIds: string[];
  priceIdr: number;
  audience?: string;
}

export interface CurrentUserProfile {
  name: string;
  role: Role;
  interests: Interest[];
  lookingFor: LookingFor[];
  city: string;
  about: string;
  company: string;
  avatarHue: number;
  initials: string;
}

export interface AppState {
  isOnboarded: boolean;
  currentUser: CurrentUserProfile | null;
  sessions: WfcSession[];
  events: CommunityEvent[];
  people: User[];
  joinedSessionIds: string[];
  rsvpedEventIds: string[];
}
