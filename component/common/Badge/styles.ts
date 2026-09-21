import type { BadgeColor, BadgeProps, BadgeSize } from "@/types/badge";

export const BASE_BADGE_STYLES =
  "inline-flex items-center justify-center rounded-full font-bold";

export const BADGE_SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-4 py-1 text-overline-small",
  md: "px-5 py-2 text-caption"
};

export const BADGE_COLOR_STYLES: Record<BadgeColor, string> = {
  gray: "bg-canvas text-content-muted border border-border",
  primary: "bg-primary-50 text-primary-600",
  kakao: "bg-kakao text-kakao-content"
};

export function getBadgeClassName({
  color = "gray",
  size = "sm",
  className
}: Pick<BadgeProps, "color" | "size" | "className">) {
  return [BASE_BADGE_STYLES, BADGE_SIZE_STYLES[size], BADGE_COLOR_STYLES[color], className]
    .filter(Boolean)
    .join(" ");
}
