import Link from "next/link";

import Avatar from "@/components/ui/Avatar/Avatar";
import type { UserFriend } from "@/service/user/user.interface";
import FriendBirthday from "./FriendBirthday";

export default function UserItem({ user }: { user: UserFriend }) {
  return (
    <li>
      <Link
        href={`/user/${encodeURIComponent(user.id)}?kakaoUserId=${user.kakaoUserId}`}
        className="flex items-center gap-3 py-3"
        aria-label={`${user.displayName} 상세 보기`}
      >
        <Avatar
          src={user.avatarUrl}
          alt=""
          fallback={user.displayName}
          size="sm"
        />
        <span className="flex flex-col">
          <span className="text-body-medium">{user.displayName}</span>
          <FriendBirthday
            birthday={user.birthday}
            birthdayType={user.birthdayType}
            isLeapMonth={user.isLeapMonth}
          />
        </span>
        {user.isFavorite ? (
          <span className="ml-auto text-body-small text-content-muted">
            즐겨찾기
          </span>
        ) : null}
      </Link>
    </li>
  );
}
