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
    // TODO: replace with real API call (POST /api/auth/set-password/)
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);

    showToast("success", "حساب ساخته شد. حالا وارد شوید.");
    navigate("/login", { replace: true });
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
            type="password"
            placeholder="حداقل ۸ کاراکتر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />

          <Input
            label="تکرار رمز عبور"
            type="password"
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
