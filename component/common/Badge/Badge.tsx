import type { BadgeProps } from "@/types/badge";
import { getBadgeClassName } from "./styles";

export default function Badge({
  children,
  color = "gray",
  size = "sm",
  className
}: BadgeProps) {
  return (
    <span className={getBadgeClassName({ color, size, className })}>{children}</span>
  );
}
