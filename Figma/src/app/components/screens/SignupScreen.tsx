import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link } from '../ui/Link';
import logo from 'figma:asset/44ef5f3c1c67b3d1d525bbc9fa0e74b73389b94f.png';

interface SignupScreenProps {
  variant?: 'desktop' | 'mobile';
  state?: 'default' | 'error' | 'loading';
}

export function SignupScreen({ variant = 'desktop', state = 'default' }: SignupScreenProps) {
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
          <h1 className="text-3xl font-bold mb-2">ثبت‌نام</h1>
          <p className="text-gray-600">
            ایمیل خود را وارد کنید تا کد تایید برایتان ارسال شود.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <Input 
            label="ایمیل" 
            type="email"
            placeholder="example@university.edu"
            error={state === 'error' ? 'ایمیل معتبر وارد کنید.' : undefined}
          />

          <Button 
            variant="primary" 
            className="w-full"
            loading={state === 'loading'}
          >
            ارسال کد تایید
          </Button>
        </div>

        {/* Bottom Link */}
        <div className="mt-8 text-center">
          <span className="text-gray-600">قبلاً ثبت‌نام کرده‌اید؟ </span>
          <Link>ورود</Link>
        </div>
      </div>
    </div>
  );
}