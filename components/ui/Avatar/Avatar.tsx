"use client";

import Image from "next/image";
import { useState } from "react";

import type { AvatarProps } from "@/types/avatar";
import { cn } from "@/lib/utils";

import { AVATAR_IMAGE_DIMENSIONS, getAvatarClassName } from "./styles";

function normalizeAvatarSrc(src?: string | null) {
  if (!src) return null;

  try {
    const url = new URL(src);
    if (url.protocol === "http:" && (url.hostname === "kakaocdn.net" || url.hostname.endsWith(".kakaocdn.net"))) {
      url.protocol = "https:";
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}

export default function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className
}: AvatarProps) {
  const normalizedSrc = normalizeAvatarSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const avatarClassName = getAvatarClassName({ size, className });

  if (normalizedSrc && failedSrc !== normalizedSrc) {
    const dimension = AVATAR_IMAGE_DIMENSIONS[size];
    return (
      <Image
        src={normalizedSrc}
        alt={alt}
        width={dimension}
        height={dimension}
        className={avatarClassName}
        onError={() => setFailedSrc(normalizedSrc)}
      />
    );
  }

  // 이미지가 없거나 로드에 실패한 경우 fallback으로 이름의 첫 글자를 표시
  return (
    <span
      className={cn(
        "flex items-center justify-center text-body-small text-content-muted",
        avatarClassName
      )}
      aria-hidden="true"
    >
      {fallback.trim().slice(0, 1) || "?"}
    </span>
  );
}
