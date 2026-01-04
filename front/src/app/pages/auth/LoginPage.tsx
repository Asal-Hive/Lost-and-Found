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
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);

    login(email);
    showToast("success", "ورود با موفقیت انجام شد!");
    const redirectTo = location?.state?.from?.pathname ?? "/";
    navigate(redirectTo, { replace: true });
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
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
