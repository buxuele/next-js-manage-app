"use client";

import { useState, useCallback } from "react";
import { ToastMessage } from "@/components/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      type: ToastMessage["type"],
      title: string,
      message: string,
      duration?: number
    ) => {
      const id = `toast_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newToast: ToastMessage = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("success", title, message, duration);
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("error", title, message, duration);
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("warning", title, message, duration);
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("info", title, message, duration);
    },
    [addToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
}
