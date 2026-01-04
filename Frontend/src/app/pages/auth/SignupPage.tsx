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
    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        // backend may return field errors e.g. { email: [...] }
        if (data && data.email && Array.isArray(data.email)) {
          setError(data.email[0]);
        } else {
          setError(data.detail || "خطا در ثبت‌نام.");
        }
      } else {
        showToast("info", data.detail || "کد تایید به ایمیل شما ارسال شد.");
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
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
