import { toResult } from "@/lib/app/app-result";
import { getCurrentUserFriends } from "@/service/user/user.server";
import UserPageClient from "./_component/user-page-client";

export default async function UserPage() {
  const initialResult = await toResult(getCurrentUserFriends(0));

  return <UserPageClient initialResult={initialResult} />;
}
