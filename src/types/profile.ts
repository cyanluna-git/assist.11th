export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  position: string | null;
  industry: string | null;
  interests: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: "admin" | "member" | "professor";
}

export interface ProfileDetail extends Profile {
  createdAt: string;
}

export interface ProfileUpdatePayload {
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  interests?: string;
  bio?: string;
  avatarUrl?: string;
}
