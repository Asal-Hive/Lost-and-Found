import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { OTPInput } from "../../components/ui/OTPInput";
import { Button } from "../../components/ui/Button";
import { Link as UILink } from "../../components/ui/Link";
import { useToast } from "./_useToast";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { showToast, ToastStack } = useToast();
  const [params] = useSearchParams();
  const email = useMemo(() => params.get("email") ?? "", [params]);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const canResend = timer <= 0;

  useEffect(() => {
    if (timer <= 0) return;
    const id = window.setInterval(() => setTimer((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resend = async () => {
    setTimer(45);
    setError(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      showToast(res.ok ? "info" : "error", data.detail || "خطا در ارسال مجدد کد.");
    } catch (e) {
      showToast("error", "خطا در ارتباط با سرور.");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    if (otp.length !== 6) {
      setError(true);
      return;
    }
    setLoading(true);
    try {
      const payload: any = { email, code: otp };
      const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(true);
        showToast("error", data.detail || "کد نادرست است.");
      } else {
        showToast("success", data.detail || "ایمیل تایید شد.");
        // Continue to set-password page to collect a required password
        navigate(`/set-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      showToast("error", "خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {ToastStack}
      <AuthShell
        title="تأیید ایمیل"
        subtitle="کد ۶ رقمی ارسال‌شده به ایمیل شما را وارد کنید."
        footer={
          <UILink onClick={() => navigate("/signup")}>تغییر ایمیل</UILink>
        }
      >
        {email ? (
          <p className="text-sm text-blue-600 -mt-4 mb-6 text-center font-medium">{email}</p>
        ) : (
          <p className="text-sm text-red-600 -mt-4 mb-6 text-center font-medium">
            ایمیل مشخص نیست. لطفاً از صفحه ثبت‌نام شروع کنید.
          </p>
        )}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block mb-4 text-gray-700 font-medium text-center">کد تایید</label>
            <OTPInput value={otp} onChange={setOtp} error={error} />
            {error && (
              <p className="mt-4 text-red-500 text-sm text-center">کد نادرست است. دوباره تلاش کنید.</p>
            )}
          </div>

          {/* password is collected on the separate SetPassword page */}

          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-500">ارسال مجدد تا {formatTime(timer)}</p>
            ) : (
              <UILink onClick={resend}>ارسال مجدد کد</UILink>
            )}
          </div>

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            تأیید و ادامه
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
