import type { UserFriend } from "@/service/user/user.interface";

type FriendBirthdayProps = Pick<
  UserFriend,
  "birthday" | "birthdayType" | "isLeapMonth"
>;

export default function FriendBirthday({
  birthday,
  birthdayType,
  isLeapMonth,
}: FriendBirthdayProps) {
  if (!birthday || !/^\d{4}$/.test(birthday)) {
    return <span className="text-body-small text-content-muted">생일 정보 없음</span>;
  }

  const month = Number(birthday.slice(0, 2));
  const day = Number(birthday.slice(2));
  const calendar = birthdayType === "LUNAR"
    ? `음력${isLeapMonth ? " 윤달" : ""}`
    : birthdayType === "SOLAR"
      ? "양력"
      : null;

  return (
    <span className="text-body-small text-content-muted">
      생일 {month}월 {day}일{calendar ? ` · ${calendar}` : ""}
    </span>
  );
}
