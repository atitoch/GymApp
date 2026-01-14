import { useState, useCallback } from "react";

export interface ToastState {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
  };
};

