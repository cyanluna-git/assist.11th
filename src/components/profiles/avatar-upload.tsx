"use client";

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export function AvatarUpload({
  src,
  name,
  isUploading,
  onUpload,
}: {
  src?: string | null;
  name: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="group relative cursor-pointer disabled:cursor-wait"
      >
        <Avatar src={src} name={name} size="lg" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-text-subtle">클릭하여 사진 변경</p>
    </div>
  );
}
