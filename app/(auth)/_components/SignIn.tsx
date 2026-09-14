'use client';

import BaseButton from '@/component/common/Button/BaseButton';

type SignInProps = {
  isSigningIn: boolean;
  onSignIn: () => void;
};

export default function SignIn({ isSigningIn, onSignIn }: SignInProps) {
  return (
    <div className="space-y-6 rounded-surface border border-border bg-surface p-8 shadow-surface">
      <div>
        <h1 className="text-heading-4">생일 펀딩</h1>
        <p className="mt-2 text-body-small text-content-muted">
          소중한 사람의 생일, 함께 축하하는 특별한 방법
        </p>
      </div>
      <BaseButton
        className="w-full bg-kakao text-kakao-content hover:bg-kakao-hover"
        size="lg"
        type="button"
        isLoading={isSigningIn}
        onClick={onSignIn}
      >
        카카오로 시작하기
      </BaseButton>
    </div>
  );
}
