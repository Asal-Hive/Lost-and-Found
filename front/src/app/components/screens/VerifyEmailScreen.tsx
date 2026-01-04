import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { OTPInput } from '../ui/OTPInput';
import { Link } from '../ui/Link';
import logo from '../../../assets/44ef5f3c1c67b3d1d525bbc9fa0e74b73389b94f.png';

interface VerifyEmailScreenProps {
  variant?: 'desktop' | 'mobile';
  state?: 'default' | 'error' | 'loading';
}

export function VerifyEmailScreen({ variant = 'desktop', state = 'default' }: VerifyEmailScreenProps) {
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isMobile = variant === 'mobile';
  const containerClass = isMobile 
    ? 'w-full min-h-screen bg-white p-6 flex flex-col' 
    : 'w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6';

  return (
    <div className={containerClass} dir="rtl">
      <div className={`w-full ${isMobile ? '' : 'max-w-md bg-white rounded-2xl shadow-xl p-8'}`}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Lost & Found" className="h-24 w-auto" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">تأیید ایمیل</h1>
          <p className="text-gray-600">
            کد ۶ رقمی ارسال‌شده به ایمیل شما را وارد کنید.
          </p>
          <p className="text-sm text-blue-600 mt-2 font-medium">
            example@university.edu
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block mb-4 text-gray-700 font-medium text-center">
            کد تایید
          </label>
          <OTPInput error={state === 'error'} />
          {state === 'error' && (
            <p className="mt-4 text-red-500 text-sm text-center">
              کد نادرست است. دوباره تلاش کنید.
            </p>
          )}
        </div>

        {/* Timer / Resend */}
        <div className="text-center mb-6">
          {!canResend ? (
            <p className="text-sm text-gray-500">
              ارسال مجدد تا {formatTime(timer)}
            </p>
          ) : (
            <Link>ارسال مجدد کد</Link>
          )}
        </div>

        {/* Change Email Link */}
        <div className="text-center mb-6">
          <Link>تغییر ایمیل</Link>
        </div>

        {/* Submit Button */}
        <Button 
          variant="primary" 
          className="w-full"
          loading={state === 'loading'}
        >
          تأیید و ادامه
        </Button>
      </div>
    </div>
  );
}