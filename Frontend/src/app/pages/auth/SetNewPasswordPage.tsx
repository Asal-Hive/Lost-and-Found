import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "./_useToast";

export default function SetNewPasswordPage() {
  const navigate = useNavigate();
  const { showToast, ToastStack } = useToast();
  const [params] = useSearchParams();
  const email = useMemo(() => params.get("email") ?? "", [params]);
  const code = useMemo(() => params.get("code") ?? "", [params]);

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
      const payload: any = { email, password, password_confirm: confirm };
      if (code) payload.code = code;
      const res = await fetch('/api/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        if (data && data.detail) {
          setError(data.detail as string);
        } else {
          setError('خطا در تغییر رمز.');
        }
        return;
      }
      showToast('success', data.detail || 'رمز عبور با موفقیت تغییر کرد.');
      setTimeout(() => navigate('/login', { replace: true }), 700);
    } catch (err) {
      setLoading(false);
      setError('خطا در برقراری ارتباط با سرور.');
    }
  };

  return (
    <>
      {ToastStack}
      <AuthShell title="رمز جدید" subtitle="رمز جدید را وارد کنید.">
        {email ? (
          <p className="text-sm text-blue-600 -mt-4 mb-6 text-center font-medium">{email}</p>
        ) : null}

        <form className="space-y-6" onSubmit={onSubmit}>
          <Input
            label="رمز جدید"
            type={showPasswords ? 'text' : 'password'}
            placeholder="حداقل ۸ کاراکتر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            trailing={
              <button
                type="button"
                onClick={() => setShowPasswords((s) => !s)}
                className="ml-6 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
              >
                {showPasswords ? 'مخفی' : 'نمایش'}
              </button>
            }
          />

          <Input
            label="تکرار رمز جدید"
            type={showPasswords ? 'text' : 'password'}
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            ثبت
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
