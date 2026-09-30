import { toResult } from "@/lib/app/app-result";
import { getCurrentUserFriend } from "@/service/user/user.server";
import UserDetail from "../_component/user-detail";

export default async function UserDetailPage({
  params,
  searchParams,
}: PageProps<"/user/[id]">) {
  const { id } = await params;
  const { kakaoUserId: rawKakaoUserId } = await searchParams;
  const kakaoUserId = typeof rawKakaoUserId === "string" ? Number(rawKakaoUserId) : NaN;
  const initialResult = Number.isSafeInteger(kakaoUserId) && kakaoUserId > 0
    ? await toResult(getCurrentUserFriend(id, kakaoUserId))
    : [null, {
        service: "user",
        error: "USER_FRIEND_NOT_FOUND",
        status: 404,
        message: "Friend not found.",
      }] as const;

  return <UserDetail initialResult={initialResult} />;
}
