"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/use-admin";

const roleLabels: Record<string, string> = {
  admin: "관리자",
  member: "원우",
  professor: "교수",
};

export function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRoleChange = (id: string, role: string) => {
    updateRole.mutate({ id, role });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" 유저를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setDeletingId(id);
    deleteUser.mutate(id, {
      onSettled: () => setDeletingId(null),
      onError: (err) => alert(err.message),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-strong">
        전체 유저 ({users?.length || 0}명)
      </h3>

      <div className="divide-y divide-foreground/5 rounded-lg border border-foreground/10 bg-card">
        {users?.length === 0 && (
          <p className="p-4 text-center text-sm text-text-muted">
            등록된 유저가 없습니다.
          </p>
        )}
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-strong">
                  {user.name}
                </span>
                <Badge variant="muted">{roleLabels[user.role] || user.role}</Badge>
              </div>
              <p className="text-xs text-text-muted">
                {user.email}
                {user.company && ` · ${user.company}`}
                {user.position && ` · ${user.position}`}
              </p>
            </div>

            {/* Role selector */}
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              disabled={updateRole.isPending}
              className="rounded-md border border-foreground/10 bg-canvas px-2 py-1 text-xs text-text-strong"
            >
              <option value="member">원우</option>
              <option value="professor">교수</option>
              <option value="admin">관리자</option>
            </select>

            {/* Delete */}
            <Button
              size="xs"
              variant="ghost"
              onClick={() => handleDelete(user.id, user.name)}
              disabled={deletingId === user.id}
              className="text-text-muted hover:text-error"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
