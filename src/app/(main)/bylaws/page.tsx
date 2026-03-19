import type { Metadata } from "next";
import { BylawsPageClient } from "./bylaws-page-client";

export const metadata: Metadata = {
  title: "운영 규정 비교 | aSSiST 11기",
  description: "원우회 운영 규정 가안과 수정안을 비교합니다.",
};

export default function BylawsPage() {
  return <BylawsPageClient />;
}
