import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import logo from 'figma:asset/44ef5f3c1c67b3d1d525bbc9fa0e74b73389b94f.png';

interface SetPasswordScreenProps {
  variant?: 'desktop' | 'mobile';
  state?: 'default' | 'error' | 'loading';
}

export function SetPasswordScreen({ variant = 'desktop', state = 'default' }: SetPasswordScreenProps) {
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
          <h1 className="text-3xl font-bold mb-2">تنظیم رمز عبور</h1>
          <p className="text-gray-600">
            یک رمز عبور برای حساب خود تعیین کنید.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <Input 
            label="رمز عبور" 
            type="password"
            placeholder="حداقل ۸ کاراکتر"
            error={state === 'error' ? 'رمزهای وارد شده یکسان نیستند.' : undefined}
          />

          <Input 
            label="تکرار رمز عبور" 
            type="password"
            placeholder="رمز خود را مجدداً وارد کنید"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-600">
              حداقل ۸ کاراکتر، شامل حرف و عدد (پیشنهادی).
            </p>
          </div>

          <Button 
            variant="primary" 
            className="w-full"
            loading={state === 'loading'}
          >
            ایجاد حساب
          </Button>
        </div>
      </div>
    </div>
  );
}