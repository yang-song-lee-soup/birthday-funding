import type { User } from "@supabase/supabase-js";

import type { ErrorResponse } from "@/lib/app/app-error";
import type { ServiceResult } from "@/lib/app/app-result";

/** 클라이언트 인증 상태와 공통 인증 명령의 소비 계약. */
export type AuthContextValue = {
  user: User | null;
  /** Provider가 원본 user에서 변환한 표시 데이터. 이름이 없으면 unknown을 사용한다. */
  userInfo: AuthProfile;
  isLogin: boolean;
  isLoading: boolean;
  authError: ErrorResponse | null;
  refetchUser: () => Promise<ServiceResult<User | null>>;
  signInWithKakao: () => Promise<ServiceResult<void>>;
  signOut: () => Promise<ServiceResult<void>>;
  handleUnauthenticated: () => void;
};

/** UI 표시용 사용자 정보. 세션 토큰이나 권한 검증 정보는 포함하지 않는다. */
export type AuthProfile = {
  displayName: string;
  avatarUrl?: string;
};
