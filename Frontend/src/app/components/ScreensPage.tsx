import { useState } from 'react';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { VerifyEmailScreen } from './screens/VerifyEmailScreen';
import { SetPasswordScreen } from './screens/SetPasswordScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { ResetOTPScreen } from './screens/ResetOTPScreen';
import { SetNewPasswordScreen } from './screens/SetNewPasswordScreen';
import { LoginRequiredModal } from './screens/LoginRequiredModal';
import { Button } from './ui/Button';

export default function ScreensPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">صفحات احراز هویت</h2>
        <p className="text-gray-600">تمام صفحات با نسخه دسکتاپ و موبایل + حالت‌های مختلف</p>
      </div>

      <div className="space-y-16">
        {/* Login Screen */}
        <ScreenSection 
          title="A. ورود (Login)"
          screens={[
            { label: 'Desktop - Default', component: <LoginScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <LoginScreen variant="desktop" state="error" /> },
            { label: 'Desktop - Loading', component: <LoginScreen variant="desktop" state="loading" /> },
            { label: 'Mobile - Default', component: <LoginScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Signup Screen */}
        <ScreenSection 
          title="B. ثبت‌نام / ورود ایمیل (Signup - Enter Email)"
          screens={[
            { label: 'Desktop - Default', component: <SignupScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <SignupScreen variant="desktop" state="error" /> },
            { label: 'Mobile - Default', component: <SignupScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Verify Email Screen */}
        <ScreenSection 
          title="C. تأیید ایمیل (Verify Email - OTP)"
          screens={[
            { label: 'Desktop - Default', component: <VerifyEmailScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <VerifyEmailScreen variant="desktop" state="error" /> },
            { label: 'Mobile - Default', component: <VerifyEmailScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Set Password Screen */}
        <ScreenSection 
          title="D. تنظیم رمز عبور (Set Password)"
          screens={[
            { label: 'Desktop - Default', component: <SetPasswordScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <SetPasswordScreen variant="desktop" state="error" /> },
            { label: 'Mobile - Default', component: <SetPasswordScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Forgot Password Screen */}
        <ScreenSection 
          title="E. فراموشی رمز عبور (Forgot Password)"
          screens={[
            { label: 'Desktop - Default', component: <ForgotPasswordScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <ForgotPasswordScreen variant="desktop" state="error" /> },
            { label: 'Mobile - Default', component: <ForgotPasswordScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Reset OTP Screen */}
        <ScreenSection 
          title="F. تأیید کد بازیابی (Reset OTP Verification)"
          screens={[
            { label: 'Desktop - Default', component: <ResetOTPScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <ResetOTPScreen variant="desktop" state="error" /> },
            { label: 'Mobile - Default', component: <ResetOTPScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Set New Password Screen */}
        <ScreenSection 
          title="G. رمز جدید (Set New Password)"
          screens={[
            { label: 'Desktop - Default', component: <SetNewPasswordScreen variant="desktop" state="default" /> },
            { label: 'Desktop - Error', component: <SetNewPasswordScreen variant="desktop" state="error" /> },
            { label: 'Mobile - Default', component: <SetNewPasswordScreen variant="mobile" state="default" /> },
          ]}
        />

        {/* Login Required Modal */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-2xl font-bold mb-6">H. مودال «ورود الزامی» (Login Required Modal)</h3>
          <p className="text-gray-600 mb-6">
            این مودال زمانی نمایش داده می‌شود که کاربر بدون ورود بخواهد اقداماتی مانند ثبت آیتم، ارسال کامنت یا ویرایش انجام دهد.
          </p>
          
          <Button onClick={() => setShowLoginModal(true)}>
            نمایش مودال
          </Button>

          <LoginRequiredModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />

          <div className="mt-8 border-t pt-6">
            <h4 className="font-bold mb-3">پیش‌نمایش استاتیک:</h4>
            <div className="bg-gray-50 rounded-lg p-4 relative">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" dir="rtl">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-3">برای ادامه وارد شوید</h2>
                    <p className="text-gray-600">
                      مشاهده نقشه آزاد است، اما برای ثبت آیتم یا ارسال کامنت باید وارد شوید.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button variant="primary" className="w-full">ورود</Button>
                    <Button variant="secondary" className="w-full">ثبت‌نام</Button>
                    <div className="text-center text-gray-500 py-2">فعلاً نه</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Specification */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-sm p-8">
          <h3 className="text-2xl font-bold mb-6">مشخصات فنی برای توسعه‌دهندگان</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h4 className="font-bold mb-3 text-yellow-300">API Endpoints (Django)</h4>
              <div className="space-y-2 text-sm font-mono" dir="ltr">
                <div>POST /api/auth/signup/</div>
                <div className="text-gray-300 mr-4">→ body: {`{ email }`}</div>
                <div>POST /api/auth/verify-email/</div>
                <div className="text-gray-300 mr-4">→ body: {`{ email, otp }`}</div>
                <div>POST /api/auth/set-password/</div>
                <div className="text-gray-300 mr-4">→ body: {`{ email, password }`}</div>
                <div>POST /api/auth/login/</div>
                <div className="text-gray-300 mr-4">→ body: {`{ email, password }`}</div>
                <div>POST /api/auth/forgot-password/</div>
                <div className="text-gray-300 mr-4">→ body: {`{ email }`}</div>
                <div>POST /api/auth/reset-password/</div>
                <div className="text-gray-300 mr-4">→ body: {`{ email, otp, password }`}</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h4 className="font-bold mb-3 text-green-300">مسیرها (Routes)</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-blue-300">/login</span> - صفحه ورود</div>
                <div><span className="text-blue-300">/signup</span> - ثبت‌نام (ورود ایمیل)</div>
                <div><span className="text-blue-300">/verify-email</span> - تأیید OTP</div>
                <div><span className="text-blue-300">/set-password</span> - تنظیم رمز</div>
                <div><span className="text-blue-300">/forgot-password</span> - بازیابی</div>
                <div><span className="text-blue-300">/reset-password</span> - رمز جدید</div>
                <div className="pt-2 border-t border-white/20">
                  <span className="text-purple-300">Protected routes:</span> نیاز به auth guard
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h4 className="font-bold mb-3 text-pink-300">State Management</h4>
              <div className="space-y-2 text-sm">
                <div>• <span className="text-yellow-200">authContext</span> یا Redux برای user state</div>
                <div>• <span className="text-yellow-200">isAuthenticated</span>: boolean</div>
                <div>• <span className="text-yellow-200">user</span>: {`{ id, email, name }`}</div>
                <div>• <span className="text-yellow-200">token</span>: JWT یا session ID</div>
                <div>• LocalStorage برای persistence</div>
                <div>• Auto-refresh token در صورت استفاده از JWT</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h4 className="font-bold mb-3 text-cyan-300">Validation Rules</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Email:</strong> pattern + domain check</div>
                <div><strong>Password:</strong> min 8 chars, letter + number</div>
                <div><strong>OTP:</strong> 6 digits, numeric only</div>
                <div><strong>OTP expiry:</strong> 45 seconds (resend)</div>
                <div><strong>Rate limiting:</strong> max 3 attempts</div>
                <div><strong>Session timeout:</strong> configurable</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white/10 rounded-lg p-4 backdrop-blur">
            <h4 className="font-bold mb-3">✅ Checklist برای پیاده‌سازی</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2 text-blue-300">Frontend:</p>
                <ul className="space-y-1 mr-4">
                  <li>☐ React Router setup</li>
                  <li>☐ Auth Context/Redux</li>
                  <li>☐ Protected Route guards</li>
                  <li>☐ Form validation (react-hook-form)</li>
                  <li>☐ Toast notifications</li>
                  <li>☐ RTL support (dir="rtl")</li>
                  <li>☐ Persian font (Vazirmatn)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 text-green-300">Backend:</p>
                <ul className="space-y-1 mr-4">
                  <li>☐ Django User model</li>
                  <li>☐ OTP generation/validation</li>
                  <li>☐ Email service (SMTP)</li>
                  <li>☐ JWT or Session auth</li>
                  <li>☐ Password hashing (bcrypt)</li>
                  <li>☐ Rate limiting (DRF throttle)</li>
                  <li>☐ CORS configuration</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 text-purple-300">Testing:</p>
                <ul className="space-y-1 mr-4">
                  <li>☐ Unit tests (components)</li>
                  <li>☐ Integration tests (API)</li>
                  <li>☐ E2E flow tests</li>
                  <li>☐ Mobile responsive check</li>
                  <li>☐ RTL layout verification</li>
                  <li>☐ Error state coverage</li>
                  <li>☐ Security audit</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

interface ScreenSectionProps {
  title: string;
  screens: Array<{
    label: string;
    component: React.ReactNode;
  }>;
}

function ScreenSection({ title, screens }: ScreenSectionProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-8">
      <h3 className="text-2xl font-bold mb-8">{title}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {screens.map((screen, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">{screen.label}</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {screen.label.includes('Desktop') ? '1440×900' : '375×667'}
              </span>
            </div>
            <div className={`border-2 border-gray-200 rounded-lg overflow-hidden ${
              screen.label.includes('Mobile') ? 'max-w-[375px] mx-auto' : ''
            }`} style={{ 
              height: screen.label.includes('Mobile') ? '667px' : '900px',
              maxWidth: screen.label.includes('Mobile') ? '375px' : '100%'
            }}>
              <div className="w-full h-full overflow-auto">
                {screen.component}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}