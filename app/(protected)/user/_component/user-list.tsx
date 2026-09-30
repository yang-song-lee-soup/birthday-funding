import BaseButton from "@/components/ui/Button/BaseButton";
import type { UserFriend } from "@/service/user/user.interface";
import UserItem from "./user-item";

type UserListProps = {
  users: UserFriend[];
  totalCount: number;
  isLoading: boolean;
  onLoadMore: () => void;
};

export default function UserList({
  users,
  totalCount,
  isLoading,
  onLoadMore,
}: UserListProps) {
  if (users.length === 0) {
    return (
      <p className="py-12 text-center text-content-muted">
        표시할 카카오톡 친구가 없습니다.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-4 divide-y divide-border">
        {users.map((user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </ul>
      {users.length < totalCount ? (
        <BaseButton
          className="mt-5 w-full"
          color="gray"
          isLoading={isLoading}
          onClick={onLoadMore}
        >
          친구 더 보기
        </BaseButton>
      ) : null}
    </>
  );
}
