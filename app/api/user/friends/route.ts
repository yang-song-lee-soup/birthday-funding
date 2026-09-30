import { NextResponse } from "next/server";

import { AppError } from "@/lib/app/app-error";
import { getCurrentUserFriends } from "@/service/user/user.server";
import { parseUserFriendsOffset } from "@/service/user/user.util";

export async function GET(request: Request) {
  const offset = parseUserFriendsOffset(request.url);
  if (offset === null) {
    return NextResponse.json({ code: "INVALID_OFFSET", message: "Invalid offset." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getCurrentUserFriends(offset));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { code: error.error, message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to load friends." },
      { status: 500 },
    );
  }
}
