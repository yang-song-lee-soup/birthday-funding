export type AvatarSize = "sm" | "md";

export interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: AvatarSize;
  className?: string;
}
