import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Link } from '../ui/Link';
import logo from 'figma:asset/44ef5f3c1c67b3d1d525bbc9fa0e74b73389b94f.png';

interface LoginScreenProps {
  variant?: 'desktop' | 'mobile';
  state?: 'default' | 'error' | 'loading';
}

export function LoginScreen({ variant = 'desktop', state = 'default' }: LoginScreenProps) {
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
          <h1 className="text-3xl font-bold mb-2">ورود</h1>
          <p className="text-gray-600">
            برای ثبت آیتم، شرکت در گفتگو و مدیریت محتوای خود وارد شوید.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <Input 
            label="ایمیل" 
            type="email"
            placeholder="example@university.edu"
            error={state === 'error' ? 'ایمیل یا رمز عبور اشتباه است.' : undefined}
          />

          <Input 
            label="رمز عبور" 
            type="password"
            placeholder="********"
          />

          <div className="flex items-center justify-between">
            <Checkbox label="مرا به خاطر بسپار" />
            <Link>رمز عبور را فراموش کرده‌اید؟</Link>
          </div>

          <Button 
            variant="primary" 
            className="w-full"
            loading={state === 'loading'}
          >
            ورود
          </Button>
        </div>

        {/* Bottom Link */}
        <div className="mt-8 text-center">
          <span className="text-gray-600">حساب ندارید؟ </span>
          <Link>ثبت‌نام</Link>
        </div>
      </div>
    </div>
  );
}