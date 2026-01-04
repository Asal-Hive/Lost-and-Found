import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "./_useToast";

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const { showToast, ToastStack } = useToast();
  const [params] = useSearchParams();
  const email = useMemo(() => params.get("email") ?? "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (password !== confirm) {
      setError("رمزهای وارد شده یکسان نیستند.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/set-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, password_confirm: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "خطا در ثبت رمز.");
      } else {
        showToast("success", data.detail);
        // store tokens if returned
        if (data.access && data.refresh) {
          try {
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
          } catch (e) {}
        }
        // give toast a moment to display before navigating
        setTimeout(() => navigate("/", { replace: true }), 700);
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {ToastStack}
      <AuthShell
        title="تنظیم رمز عبور"
        subtitle="برای حساب خود یک رمز عبور تعیین کنید."
      >
        {email ? (
          <p className="text-sm text-blue-600 -mt-4 mb-6 text-center font-medium">{email}</p>
        ) : null}

        <form className="space-y-6" onSubmit={onSubmit}>
          <Input
            label="رمز عبور"
            type={showPasswords ? 'text' : 'password'}
            placeholder="حداقل ۸ کاراکتر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            trailing={
              <button
                type="button"
                onClick={() => setShowPasswords((s) => !s)}
                className="text-sm text-gray-600 hover:text-gray-900"
                aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
              >
                {showPasswords ? 'مخفی' : 'نمایش'}
              </button>
            }
          />

          <Input
            label="تکرار رمز عبور"
            type={showPasswords ? 'text' : 'password'}
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            ثبت و ادامه
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
