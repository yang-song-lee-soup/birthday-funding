import type { User } from "@supabase/supabase-js";

import type { AuthProfile } from "./auth.interface";

/** 조회 없이 Supabase 사용자를 공통 표시 정보로 변환한다. Provider가 userInfo로 공유한다. */
export function getAuthProfile(user: User | null): AuthProfile {
  if (!user) return { displayName: "unknown", avatarUrl: undefined };

  const metadata = user.user_metadata;

  const displayName = [
    metadata.full_name,
    metadata.name,
    metadata.preferred_username,
    user.email,
  ].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ) ?? "unknown";

  const avatarUrl =  typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;

  return {
    displayName,
    avatarUrl
  };
}
