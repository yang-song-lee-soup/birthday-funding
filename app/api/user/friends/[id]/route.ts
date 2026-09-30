import { NextResponse } from "next/server";

import { AppError } from "@/lib/app/app-error";
import { getCurrentUserFriend } from "@/service/user/user.server";

export async function GET(
  request: Request,
  context: RouteContext<"/api/user/friends/[id]">,
) {
  const { id } = await context.params;
  const kakaoUserId = Number(new URL(request.url).searchParams.get("kakaoUserId"));

  if (!Number.isSafeInteger(kakaoUserId) || kakaoUserId <= 0) {
    return NextResponse.json(
      { code: "USER_FRIEND_NOT_FOUND", message: "Friend not found." },
      { status: 404 },
    );
  }

  try {
    const friend = await getCurrentUserFriend(id, kakaoUserId);
    if (!friend) {
      return NextResponse.json(
        { code: "USER_FRIEND_NOT_FOUND", message: "Friend not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(friend);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { code: error.error, message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to load friend." },
      { status: 500 },
    );
  }
}
