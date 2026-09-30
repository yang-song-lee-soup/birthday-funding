export type UserFriend = {
  id: string;
  kakaoUserId: number;
  displayName: string;
  avatarUrl?: string;
  isFavorite: boolean;
  birthday?: string;
  birthdayType?: "SOLAR" | "LUNAR";
  isLeapMonth?: boolean;
};

export type UserFriendDetail = Omit<UserFriend, "kakaoUserId" | "isFavorite">;

export type UserFriendList = {
  friends: UserFriend[];
  totalCount: number;
  nextOffset: number;
};

export type UserFriendsErrorCode =
  | "UNAUTHORIZED"
  | "USER_FRIEND_NOT_FOUND"
  | "KAKAO_AUTHORIZATION_EXPIRED"
  | "KAKAO_ADDITIONAL_CONSENT_REQUIRED"
  | "KAKAO_TESTER_REQUIRED"
  | "KAKAO_RATE_LIMITED"
  | "KAKAO_FRIENDS_REQUEST_FAILED";

export type UserFriendsErrorResponse = {
  code?: UserFriendsErrorCode;
  message?: string;
};
