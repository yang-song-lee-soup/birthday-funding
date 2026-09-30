"use client";

import { useToastMessageContext } from "@/providers/ToastMessageProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductErrorToast({ message }: { message: string }) {
  const { showToastMessage } = useToastMessageContext();
  const router = useRouter();

  useEffect(() => {
    showToastMessage({ type: "error", message });

    setTimeout(() => {
      router.back();
    }, 3000);
  }, [message, showToastMessage, router]);

  return null;
}
