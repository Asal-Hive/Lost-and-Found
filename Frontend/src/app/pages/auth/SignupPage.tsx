import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Link as UILink } from "../../components/ui/Link";
import { useToast } from "./_useToast";

export default function SignupPage() {
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
    // TODO: replace with real API call (POST /api/auth/signup/)
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);
    showToast("info", "کد تایید به ایمیل شما ارسال شد.");
    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <>
      {ToastStack}
      <AuthShell
        title="ثبت‌نام"
        subtitle="ایمیل خود را وارد کنید تا کد تایید برایتان ارسال شود."
        footer={
          <>
            <span className="text-gray-600">قبلاً ثبت‌نام کرده‌اید؟ </span>
            <UILink onClick={() => navigate("/login")}>ورود</UILink>
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

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            ارسال کد تایید
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
