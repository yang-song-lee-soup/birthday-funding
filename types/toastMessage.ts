export type ToastMessageProps = {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
};

export type ToastMessageContextType = {
    toastMessages: ToastMessageProps[];
    showToastMessage: ({ message, type }: { message: string; type: ToastMessageProps['type'] }) => void;
    removeToastMessage: (id: string) => void;
};
