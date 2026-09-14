import type { BaseButtonProps, ButtonColor, ButtonSize, ButtonVariant } from '@/types/button';

export const BASE_BUTTON_STYLES = `
  inline-flex
  items-center
  justify-center
  font-medium
  transition-colors
  duration-150
  disabled:opacity-50
  disabled:cursor-not-allowed
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary
  focus-visible:ring-offset-2
  gap-2
`;

export const BUTTON_SIZE_STYLES: Record<ButtonSize, string> = {
    icon: 'h-button-icon w-button-icon',
    sm: 'h-button-sm px-4 text-body-small',
    md: 'h-button-md px-6 text-body',
    lg: 'h-button-lg px-8 text-body',
    full: 'h-button-lg w-full px-8 text-body',
};

export const BUTTON_VARIANT_STYLES: Record<ButtonVariant, Record<ButtonColor, string>> = {
    filled: {
        primary: 'bg-primary text-on-primary hover:bg-primary-600 active:bg-primary-700',
        'primary-500': 'bg-primary-500 text-on-primary hover:bg-primary-600 active:bg-primary-700',
        'primary-400': 'bg-primary-400 text-on-primary hover:bg-primary-500 active:bg-primary-600',
        icon: '',
        white: 'bg-surface text-content border border-border hover:bg-canvas',
        gray: 'bg-gray-800 text-on-primary hover:bg-gray-700',
    },
    text: {
        primary: 'text-primary hover:bg-primary/10 active:bg-primary/20',
        'primary-500': 'text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20',
        'primary-400': 'text-primary-400 hover:bg-primary-400/10 active:bg-primary-400/20',
        icon: '',
        white: 'text-content hover:bg-content/10',
        gray: 'text-content-muted hover:bg-content/10',
    },
    icon: {
        primary: 'text-primary hover:bg-primary/10',
        'primary-500': 'text-primary-500 hover:bg-primary-500/10',
        'primary-400': 'text-primary-400 hover:bg-primary-400/10',
        icon: 'text-current hover:bg-content/10',
        white: 'text-white hover:bg-black-100',
        gray: 'text-content-muted hover:bg-content/10',
    },
    'icon-round': {
        primary: 'text-primary hover:bg-primary/10',
        'primary-500': 'text-primary-500 hover:bg-primary-500/10',
        'primary-400': 'text-primary-400 hover:bg-primary-400/10',
        icon: 'text-current hover:bg-content/10',
        white: 'text-white hover:bg-black-100',
        gray: 'text-content-muted hover:bg-content/10',
    },
};

export function getButtonClassName({
    size,
    variant,
    color,
    isLoading,
    className,
}: Pick<BaseButtonProps, 'size' | 'variant' | 'color' | 'isLoading' | 'className'>) {
    return [
        BASE_BUTTON_STYLES,
        variant === 'icon-round' ? 'rounded-full' : 'rounded-control',
        BUTTON_SIZE_STYLES[size ?? 'md'],
        color === null ? '' : BUTTON_VARIANT_STYLES[variant ?? 'filled'][color ?? 'primary'],
        isLoading ? 'cursor-wait' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');
}
