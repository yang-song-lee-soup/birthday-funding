import { cn } from "@/lib/utils";

export const DROPDOWN_MENU_CONTENT_STYLES = `
  z-50
  max-h-(--available-height)
  min-w-[16rem]
  origin-(--transform-origin)
  overflow-x-hidden
  overflow-y-auto
  rounded-control
  border
  border-border
  bg-surface
  p-2
  text-content
  shadow-surface
  duration-100
  outline-none
  data-[side=bottom]:slide-in-from-top-2
  data-[side=left]:slide-in-from-right-2
  data-[side=right]:slide-in-from-left-2
  data-[side=top]:slide-in-from-bottom-2
  data-open:animate-in
  data-open:fade-in-0
  data-open:zoom-in-95
  data-closed:animate-out
  data-closed:fade-out-0
  data-closed:zoom-out-95
`;

export const DROPDOWN_MENU_LABEL_STYLES = `
  px-4
  py-2
  text-body-xs
  font-medium
  text-content-muted
  data-inset:pl-10
`;

export const DROPDOWN_MENU_ITEM_STYLES = `
  group/dropdown-menu-item
  relative
  flex
  cursor-pointer
  select-none
  items-center
  gap-2
  rounded-control
  px-4
  py-3
  text-body-small
  outline-none
  focus:bg-canvas
  focus:text-content
  data-inset:pl-10
  data-[variant=destructive]:text-error
  data-[variant=destructive]:focus:bg-error-50
  data-[variant=destructive]:focus:text-error
  data-disabled:pointer-events-none
  data-disabled:cursor-not-allowed
  data-disabled:opacity-50
  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-8
`;

export const DROPDOWN_MENU_SUB_TRIGGER_STYLES = `
  flex
  cursor-pointer
  select-none
  items-center
  gap-2
  rounded-control
  px-4
  py-3
  text-body-small
  outline-none
  focus:bg-canvas
  focus:text-content
  data-inset:pl-10
  data-popup-open:bg-canvas
  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-8
`;

export const DROPDOWN_MENU_SUB_CONTENT_STYLES = `
  w-auto
  min-w-[16rem]
`;

export const DROPDOWN_MENU_CHECKABLE_ITEM_STYLES = `
  relative
  flex
  cursor-pointer
  select-none
  items-center
  gap-2
  rounded-control
  py-3
  pr-10
  pl-4
  text-body-small
  outline-none
  focus:bg-canvas
  focus:text-content
  data-inset:pl-10
  data-disabled:pointer-events-none
  data-disabled:cursor-not-allowed
  data-disabled:opacity-50
  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-8
`;

export const DROPDOWN_MENU_SEPARATOR_STYLES = "-mx-2 my-2 h-px bg-border";

export const DROPDOWN_MENU_SHORTCUT_STYLES = `
  ml-auto
  text-body-xs
  tracking-wider
  text-content-muted
`;

export function getDropdownMenuClassName(baseClassName: string, className?: string): string;
export function getDropdownMenuClassName<State>(
  baseClassName: string,
  className?: string | ((state: State) => string | undefined)
): string | ((state: State) => string);
export function getDropdownMenuClassName<State>(
  baseClassName: string,
  className?: string | ((state: State) => string | undefined)
) {
  if (typeof className === "function") {
    return (state: State) => cn(baseClassName, className(state));
  }

  return cn(baseClassName, className);
}
