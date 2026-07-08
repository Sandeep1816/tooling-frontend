"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";

const sizeMap = {
  sm: { box: "w-10 h-10", icon: 18, text: "text-sm" },
  md: { box: "w-16 h-16", icon: 24, text: "text-base" },
  lg: { box: "w-20 h-20", icon: 28, text: "text-lg" },
  xl: { box: "w-24 h-24", icon: 32, text: "text-xl" },
} as const;

function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function CandidateAvatar({
  avatarUrl,
  name,
  size = "md",
  className = "",
  borderClassName = "",
}: {
  avatarUrl?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  className?: string;
  borderClassName?: string;
}) {
  const config = sizeMap[size];
  const initials = getInitials(name);

  if (avatarUrl) {
    const src = resolveMediaUrl(avatarUrl);
    return (
      <div className={`relative ${config.box} flex-shrink-0 ${className}`}>
        <Image
          key={avatarUrl}
          src={src}
          alt={name || "Profile photo"}
          fill
          className={`rounded-full object-cover bg-white ${borderClassName}`}
          sizes={size === "xl" ? "96px" : size === "lg" ? "80px" : size === "md" ? "64px" : "40px"}
          unoptimized={src.includes("cloudinary")}
        />
      </div>
    );
  }

  return (
    <div
      className={`${config.box} flex-shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center ${borderClassName} ${className}`}
      aria-label={name ? `${name} avatar placeholder` : "No profile photo"}
    >
      {initials ? (
        <span className={`font-semibold ${config.text}`}>{initials}</span>
      ) : (
        <User size={config.icon} />
      )}
    </div>
  );
}
