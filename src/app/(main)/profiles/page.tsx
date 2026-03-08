import type { Metadata } from "next";
import { ProfilesPageClient } from "./profiles-page-client";

export const metadata: Metadata = {
  title: "프로필 디렉토리 | ASSIST 11기",
  description: "ASSIST 11기 원우 프로필 디렉토리",
};

export default function ProfilesPage() {
  return <ProfilesPageClient />;
}
