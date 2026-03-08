"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ProfileSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <Input
        type="text"
        placeholder="이름, 회사, 업종 검색"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
