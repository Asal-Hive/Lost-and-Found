import React, { useCallback, useState } from "react";
import { Toast } from "../../components/ui/Toast";

type ToastType = "success" | "error" | "info";

export function useToast() {
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const ToastStack = toast ? (
    <div className="fixed top-4 left-4 z-[100]">
      <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
    </div>
  ) : null;

  return { showToast, ToastStack };
}
