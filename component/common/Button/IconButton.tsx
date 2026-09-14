'use client';

import { forwardRef } from 'react';
import BaseButton from './BaseButton';
import type { BaseButtonProps } from '@/types/button';

type IconButtonProps = Omit<BaseButtonProps, 'leftIcon' | 'rightIcon' | 'children'> & {
    icon: React.ReactNode;
    label: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ size = 'icon', variant = 'icon', color, icon, label, ...props }, ref) => (
        <BaseButton {...props} ref={ref} size={size} variant={variant} color={color} aria-label={label}>
            <span aria-hidden="true" className="inline-flex">{icon}</span>
        </BaseButton>
    )
);

IconButton.displayName = 'IconButton';
export default IconButton;
