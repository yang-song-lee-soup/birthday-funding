"use client";

import { useToastMessageContext } from "@/providers/ToastMessageProvider";
import { useEffect } from "react";

export default function ProductErrorToast({ message }: { message: string }) {
  const { showToastMessage } = useToastMessageContext();

  useEffect(() => {
    showToastMessage({ type: "error", message });
  }, [message, showToastMessage]);

  return null;
}
