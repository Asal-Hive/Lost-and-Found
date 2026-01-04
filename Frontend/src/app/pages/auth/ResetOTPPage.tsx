import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "./_AuthShell";
import { OTPInput } from "../../components/ui/OTPInput";
import { Button } from "../../components/ui/Button";
import { Link as UILink } from "../../components/ui/Link";
import { useToast } from "./_useToast";

export default function ResetOTPPage() {
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
    // TODO: API resend
    showToast("info", "کد جدید ارسال شد.");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    if (otp.length !== 6) {
      setError(true);
      return;
    }
    setLoading(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);
    navigate(`/set-new-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <>
      {ToastStack}
      <AuthShell
        title="تأیید کد بازیابی"
        subtitle="کد ۶ رقمی ارسال‌شده برای بازیابی را وارد کنید."
      >
        {email ? (
          <p className="text-sm text-blue-600 -mt-4 mb-6 text-center font-medium">{email}</p>
        ) : null}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block mb-4 text-gray-700 font-medium text-center">کد تایید</label>
            <OTPInput value={otp} onChange={setOtp} error={error} />
            {error && (
              <p className="mt-4 text-red-500 text-sm text-center">کد نادرست است. دوباره تلاش کنید.</p>
            )}
          </div>

          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-500">ارسال مجدد تا {formatTime(timer)}</p>
            ) : (
              <UILink onClick={resend}>ارسال مجدد کد</UILink>
            )}
          </div>

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            ادامه
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
