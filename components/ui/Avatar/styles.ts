import type { AvatarProps, AvatarSize } from "@/types/avatar";
import { cn } from "@/lib/utils";

export const BASE_AVATAR_STYLES = `
  shrink-0
  rounded-full
  bg-gray-100
  object-cover
`;

export const AVATAR_SIZE_STYLES: Record<AvatarSize, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14"
};

export const AVATAR_IMAGE_DIMENSIONS: Record<AvatarSize, number> = {
  sm: 40,
  md: 56
};

export function getAvatarClassName({
  size = "md",
  className
}: Pick<AvatarProps, "size" | "className">) {
  return cn(BASE_AVATAR_STYLES, AVATAR_SIZE_STYLES[size], className);
}
