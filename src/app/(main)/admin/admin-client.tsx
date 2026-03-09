"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InvitationsTab } from "@/components/admin/invitations-tab";
import { UsersTab } from "@/components/admin/users-tab";

const tabs = [
  { key: "invitations", label: "초대 관리" },
  { key: "users", label: "유저 관리" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function AdminClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("invitations");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-card text-text-strong shadow-sm"
                : "text-text-muted hover:text-text-main",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "invitations" && <InvitationsTab />}
      {activeTab === "users" && <UsersTab />}
    </div>
  );
}
