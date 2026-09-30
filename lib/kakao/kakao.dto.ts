export type KakaoFriendDto = {
  id: number;
  uuid: string;
  favorite?: boolean;
  profile_nickname?: string;
  profile_thumbnail_image?: string;
};

export type KakaoBirthdayType = "SOLAR" | "LUNAR";

export type KakaoProfileDto = {
  nickname?: string;
  profile_image_url?: string;
  thumbnail_image_url?: string;
};

export type KakaoAccountDto = {
  profile?: KakaoProfileDto;
  birthday_needs_agreement?: boolean;
  birthday?: string;
  birthday_type?: KakaoBirthdayType;
  is_leap_month?: boolean;
};

export type KakaoUserInfoDto = {
  id: number;
  kakao_account?: KakaoAccountDto;
  for_partner?: {
    uuid?: string;
  };
};

export type KakaoFriendsDto = {
  elements?: KakaoFriendDto[];
  total_count: number;
  favorite_count?: number;
};

export type KakaoErrorDto = {
  code?: number;
  msg?: string;
  required_scopes?: string[];
};
