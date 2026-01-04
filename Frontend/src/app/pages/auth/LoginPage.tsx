import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { Link as UILink } from "../../components/ui/Link";
import { useAuth } from "../../auth/AuthProvider";
import { useToast } from "./_useToast";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { login } = useAuth();
  const { showToast, ToastStack } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!email.trim() || !password.trim()) {
      setError("ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "اطلاعات ورود نامعتبر.");
      } else {
        // use AuthProvider to persist user and tokens
        const tokens = { access: data.access, refresh: data.refresh };
        login(email, tokens, remember);
        showToast("success", "ورود با موفقیت انجام شد!");
        const redirectTo = location?.state?.from?.pathname ?? "/";
        setTimeout(() => navigate(redirectTo, { replace: true }), 700);
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
        title="ورود"
        subtitle="برای ثبت آیتم، شرکت در گفتگو و مدیریت محتوای خود وارد شوید."
        footer={
          <>
            <span className="text-gray-600">حساب ندارید؟ </span>
            <UILink onClick={() => navigate("/signup")}>ثبت‌نام</UILink>
          </>
        }
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          <Input
            label="ایمیل"
            type="email"
            placeholder="example@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />

          <Input
            label="رمز عبور"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="ml-6 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'مخفی' : 'نمایش'}
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <Checkbox label="مرا به خاطر بسپار" checked={remember} onChange={setRemember} />
            <UILink onClick={() => navigate("/forgot-password")}>رمز عبور را فراموش کرده‌اید؟</UILink>
          </div>

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            ورود
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
