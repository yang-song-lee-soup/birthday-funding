import { NextResponse } from "next/server";

import { getProviderToken, getRequestUser } from "@/app/service/auth/server/auth.service";

type KakaoFriend = {
  id: number;
  uuid: string;
  favorite?: boolean;
  profile_nickname?: string;
  profile_thumbnail_image?: string;
};

type KakaoFriendsResponse = {
  elements?: KakaoFriend[];
  total_count: number;
  favorite_count?: number;
};

type KakaoErrorResponse = {
  msg?: string;
};

const TESTER_REQUIRED_MESSAGE = "현재 앱 개발/테스트 단계 앱으로 카카오톡 친구 목록은 테스트 멤버끼리만 확인할 수 있습니다. 앱 관리자에게 테스트 멤버 추가를 요청한 뒤 다시 시도해 주세요.";

function isTesterRequiredError(message?: string) {
  return message?.includes("There are no team members except the caller") ?? false;
}

function toOffset(value: string | null) {
  const offset = Number(value ?? "0");
  return Number.isInteger(offset) && offset >= 0 ? offset : null;
}

export async function GET(request: Request) {
  const offset = toOffset(new URL(request.url).searchParams.get("offset"));
  if (offset === null) {
    return NextResponse.json({ message: "Invalid offset." }, { status: 400 });
  }

  const user = await getRequestUser();
  if (!user) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const providerToken = await getProviderToken();
  if (!providerToken) {
    return NextResponse.json({ message: "Kakao authorization has expired. Please sign in again." }, { status: 401 });
  }

  const kakaoUrl = new URL("https://kapi.kakao.com/v1/api/talk/friends");
  kakaoUrl.searchParams.set("offset", String(offset));
  kakaoUrl.searchParams.set("limit", "100");
  kakaoUrl.searchParams.set("friend_order", "nickname");

  try {
    const response = await fetch(kakaoUrl, {
      headers: { Authorization: `Bearer ${providerToken}` },
      cache: "no-store",
    });
    const payload = (await response.json()) as KakaoFriendsResponse | KakaoErrorResponse;
    if (!response.ok) {
      const kakaoMessage = "msg" in payload ? payload.msg : undefined;
      if (isTesterRequiredError(kakaoMessage)) {
        return NextResponse.json(
          { code: "KAKAO_TESTER_REQUIRED", message: TESTER_REQUIRED_MESSAGE },
          { status: response.status },
        );
      }

      return NextResponse.json({ message: "Failed to load Kakao friends." }, { status: response.status });
    }

    const friends = (payload as KakaoFriendsResponse).elements ?? [];
    return NextResponse.json({ friends, totalCount: (payload as KakaoFriendsResponse).total_count, nextOffset: offset + friends.length });
  } catch {
    return NextResponse.json({ message: "Failed to reach Kakao." }, { status: 502 });
  }
}
