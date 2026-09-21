export type BadgeColor = "gray" | "primary" | "kakao";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
}
