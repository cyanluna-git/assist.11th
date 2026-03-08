import type { Metadata } from "next";
import { ProfileDetailClient } from "./profile-detail-client";

export const metadata: Metadata = {
  title: "프로필 상세 | ASSIST 11기",
  description: "원우 프로필 상세 정보",
};

export default function ProfileDetailPage() {
  return <ProfileDetailClient />;
}
