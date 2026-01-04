import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Link as UILink } from "../../components/ui/Link";
import { useToast } from "./_useToast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast, ToastStack } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!email.trim() || !email.includes("@")) {
      setError("ایمیل معتبر وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        // show first error message if available
        if (data && data.email && Array.isArray(data.email)) {
          setError(data.email[0]);
        } else if (data && data.detail) {
          setError(data.detail);
        } else {
          setError('خطا در ارسال درخواست. دوباره تلاش کنید.');
        }
        return;
      }
      showToast('info', data.detail || 'کد بازیابی به ایمیل شما ارسال شد.');
      navigate(`/reset-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);
      setError('خطا در برقراری ارتباط با سرور.');
    }
  };

  return (
    <>
      {ToastStack}
      <AuthShell
        title="بازیابی رمز عبور"
        subtitle="ایمیل خود را وارد کنید تا کد بازیابی برایتان ارسال شود."
        footer={<UILink onClick={() => navigate("/login")}>بازگشت به ورود</UILink>}
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

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            ارسال کد بازیابی
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
