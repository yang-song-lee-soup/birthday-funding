export type ButtonSize = 'sm' | 'md' | 'lg' | 'full' | 'icon';
export type ButtonVariant = 'filled' | 'text' | 'icon' | 'icon-round';
export type ButtonColor = 'primary' | 'primary-500' | 'primary-400' | 'icon' | 'white' | 'gray';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: ButtonSize;
    variant?: ButtonVariant;
    // null이면 기본 색상을 생략하고 호출부의 className으로 색상을 지정
    color?: ButtonColor | null;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isLoading?: boolean;
}
