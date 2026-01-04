import { ArrowLeft } from 'lucide-react';

export default function FlowPage() {
  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">جریان احراز هویت</h2>
        <p className="text-gray-600">نقشه کامل مسیرهای ورود، ثبت‌نام و بازیابی رمز عبور</p>
      </div>

      {/* Implementation Notes */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📋 نکات پیاده‌سازی
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold mb-2 text-blue-600">Backend (Django):</h4>
            <ul className="space-y-1 text-gray-700 mr-4">
              <li>• احراز هویت مبتنی بر رمز عبور</li>
              <li>• OTP فقط برای تأیید ایمیل در ثبت‌نام</li>
              <li>• OTP اختیاری برای بازیابی رمز</li>
              <li>• ورود عادی: ایمیل + رمز (بدون OTP)</li>
              <li>• Session یا JWT برای نگهداری وضعیت</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold mb-2 text-purple-600">Frontend (React):</h4>
            <ul className="space-y-1 text-gray-700 mr-4">
              <li>• RTL layout با Vazirmatn font</li>
              <li>• مسیرهای محافظت شده با guards</li>
              <li>• Context API یا Redux برای auth state</li>
              <li>• Toast برای feedback</li>
              <li>• Responsive (desktop + mobile)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white rounded-xl shadow-sm p-8 overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Main Flow Area */}
          <div className="space-y-12">
            {/* Signup Flow */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-blue-600">مسیر ثبت‌نام (Signup)</h3>
              <div className="flex items-center gap-4">
                <FlowCard 
                  title="ثبت‌نام"
                  subtitle="Signup"
                  items={["ورود ایمیل"]}
                  color="blue"
                />
                <Arrow />
                <FlowCard 
                  title="تأیید ایمیل"
                  subtitle="Verify Email"
                  items={["ورود OTP (6 رقم)", "تایمر + ارسال مجدد"]}
                  color="blue"
                />
                <Arrow />
                <FlowCard 
                  title="تنظیم رمز عبور"
                  subtitle="Set Password"
                  items={["رمز + تکرار", "حداقل 8 کاراکتر"]}
                  color="blue"
                />
                <Arrow />
                <FlowCard 
                  title="✓ ورود موفق"
                  subtitle="Success"
                  items={["حساب ایجاد شد"]}
                  color="green"
                />
              </div>
            </div>

            {/* Login Flow */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-purple-600">مسیر ورود (Login)</h3>
              <div className="flex items-center gap-4">
                <FlowCard 
                  title="ورود"
                  subtitle="Login"
                  items={["ایمیل + رمز عبور", "مرا به خاطر بسپار"]}
                  color="purple"
                />
                <Arrow />
                <FlowCard 
                  title="✓ ورود موفق"
                  subtitle="Success"
                  items={["ورود به پنل"]}
                  color="green"
                />
              </div>
              <div className="mt-4 mr-[200px]">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300">
                    لینک: رمز عبور را فراموش کرده‌اید؟
                  </div>
                  <Arrow direction="down" />
                  <div className="text-sm text-orange-600 font-medium">
                    به مسیر بازیابی می‌رود ↓
                  </div>
                </div>
              </div>
            </div>

            {/* Password Reset Flow */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-orange-600">مسیر بازیابی رمز عبور (Password Reset)</h3>
              <div className="flex items-center gap-4">
                <FlowCard 
                  title="بازیابی رمز عبور"
                  subtitle="Forgot Password"
                  items={["ورود ایمیل"]}
                  color="orange"
                />
                <Arrow />
                <FlowCard 
                  title="تأیید کد بازیابی"
                  subtitle="Reset OTP"
                  items={["ورود OTP", "تایمر + ارسال مجدد"]}
                  color="orange"
                />
                <Arrow />
                <FlowCard 
                  title="رمز جدید"
                  subtitle="Set New Password"
                  items={["رمز جدید + تکرار"]}
                  color="orange"
                />
                <Arrow />
                <FlowCard 
                  title="✓ تغییر موفق"
                  subtitle="Success"
                  items={["به ورود هدایت شود"]}
                  color="green"
                />
              </div>
            </div>

            {/* Guest / Login Required */}
            <div className="border-t-2 border-dashed pt-8">
              <h3 className="text-lg font-bold mb-6 text-gray-600">حالت مهمان و گیت ورود (Guest Mode)</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="font-bold text-green-700 mb-2">✓ بدون ورود (مجاز)</p>
                    <ul className="text-sm text-green-600 space-y-1 mr-4">
                      <li>• مشاهده نقشه</li>
                      <li>• مشاهده لیست آیتم‌ها</li>
                      <li>• جستجو</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="font-bold text-red-700 mb-2">✕ نیاز به ورود (Login Required Modal)</p>
                    <ul className="text-sm text-red-600 space-y-1 mr-4">
                      <li>• ثبت آیتم جدید</li>
                      <li>• ارسال کامنت</li>
                      <li>• ویرایش / حذف پست خود</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs text-red-500">→ نمایش مودال "برای ادامه وارد شوید"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error States */}
            <div className="border-t-2 border-dashed pt-8">
              <h3 className="text-lg font-bold mb-6 text-red-600">وضعیت‌های خطا (Error States)</h3>
              <div className="grid grid-cols-3 gap-4">
                <ErrorStateCard 
                  title="ایمیل نامعتبر"
                  message="ایمیل معتبر وارد کنید."
                />
                <ErrorStateCard 
                  title="ورود ناموفق"
                  message="ایمیل یا رمز عبور اشتباه است."
                />
                <ErrorStateCard 
                  title="OTP نادرست"
                  message="کد نادرست است. دوباره تلاش کنید."
                />
                <ErrorStateCard 
                  title="OTP منقضی شده"
                  message="کد منقضی شده است. ارسال مجدد را بزنید."
                />
                <ErrorStateCard 
                  title="عدم تطابق رمز"
                  message="رمزهای وارد شده یکسان نیستند."
                />
                <ErrorStateCard 
                  title="خطای شبکه"
                  message="مشکلی پیش آمد. دوباره تلاش کنید."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h4 className="font-bold mb-4">راهنما:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">ثبت‌نام</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">ورود</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">بازیابی رمز</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">موفقیت</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlowCardProps {
  title: string;
  subtitle: string;
  items: string[];
  color: 'blue' | 'purple' | 'orange' | 'green';
}

function FlowCard({ title, subtitle, items, color }: FlowCardProps) {
  const colors = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50',
    green: 'border-green-500 bg-green-50',
  };

  return (
    <div className={`border-2 rounded-lg p-4 min-w-[200px] ${colors[color]}`}>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      <ul className="text-sm space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-gray-700">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Arrow({ direction = 'left' }: { direction?: 'left' | 'down' }) {
  if (direction === 'down') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-8 bg-gray-400"></div>
        <div className="text-gray-400">↓</div>
      </div>
    );
  }
  
  return <ArrowLeft className="w-6 h-6 text-gray-400 flex-shrink-0" />;
}

interface ErrorStateCardProps {
  title: string;
  message: string;
}

function ErrorStateCard({ title, message }: ErrorStateCardProps) {
  return (
    <div className="bg-white border border-red-200 rounded-lg p-3">
      <p className="font-medium text-sm mb-1">{title}</p>
      <p className="text-xs text-red-600">{message}</p>
    </div>
  );
}