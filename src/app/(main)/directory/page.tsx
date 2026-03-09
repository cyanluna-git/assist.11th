import type { Metadata } from "next";
import { DirectoryPageClient } from "./directory-page-client";

export const metadata: Metadata = {
  title: "원우 카드 | ASSIST 11기",
  description: "ASSIST 11기 원우 프로필 카드 갤러리",
};

export default function DirectoryPage() {
  return <DirectoryPageClient />;
}
