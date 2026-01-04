import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { OTPInput } from './ui/OTPInput';
import { Checkbox } from './ui/Checkbox';
import { Link } from './ui/Link';
import { Toast } from './ui/Toast';
import { Modal } from './ui/Modal';

export default function ComponentsPage() {
  const [checked, setChecked] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4" dir="rtl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">مجموعه کامپوننت‌ها</h2>
        <p className="text-gray-600">تمام کامپوننت‌های استفاده شده در سیستم احراز هویت</p>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold mb-3">📦 نحوه استفاده</h3>
        <div className="bg-white rounded-lg p-4">
          <pre className="text-sm text-left" dir="ltr">
{`// Import components
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { OTPInput } from './ui/OTPInput';

// Use in your component
<Button variant="primary" loading={isLoading}>
  ارسال
</Button>

<Input 
  label="ایمیل" 
  error={error}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>`}
          </pre>
        </div>
      </div>

      <div className="space-y-12">
        {/* Buttons */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">دکمه‌ها (Buttons)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-3">Primary</p>
              <Button variant="primary">دکمه اصلی</Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Secondary</p>
              <Button variant="secondary">دکمه ثانویه</Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Text</p>
              <Button variant="text">دکمه متنی</Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Disabled</p>
              <Button variant="primary" disabled>غیرفعال</Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Loading</p>
              <Button variant="primary" loading>در حال بارگذاری...</Button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">ورودی‌ها (Inputs)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-3">Default</p>
              <Input label="ایمیل" placeholder="example@university.edu" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Focus (کلیک کنید)</p>
              <Input label="رمز عبور" type="password" placeholder="********" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Error</p>
              <Input 
                label="ایمیل" 
                placeholder="example@university.edu"
                error="ایمیل معتبر وارد کنید."
                value="invalid-email"
                onChange={() => {}} // Read-only demo
              />
            </div>
          </div>
        </section>

        {/* OTP Input */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">ورودی کد تایید (OTP)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-3 text-center">Default State</p>
              <OTPInput value={otpValue} onChange={setOtpValue} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3 text-center">Error State</p>
              <OTPInput error />
            </div>
          </div>
        </section>

        {/* Checkbox */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">چک‌باکس (Checkbox)</h3>
          <div className="space-y-4">
            <Checkbox label="مرا به خاطر بسپار" checked={checked} onChange={setChecked} />
            <Checkbox label="قوانین را می‌پذیرم" />
          </div>
        </section>

        {/* Links */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">لینک‌ها (Links)</h3>
          <div className="space-y-4">
            <div>
              <Link>رمز عبور را فراموش کرده‌اید؟</Link>
            </div>
            <div>
              <Link>ارسال مجدد کد</Link>
            </div>
            <div>
              <span className="text-gray-600">حساب ندارید؟ </span>
              <Link>ثبت‌نام</Link>
            </div>
          </div>
        </section>

        {/* Toast */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">پیام‌ها (Toast & Messages)</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">Success Toast</p>
              <Toast type="success" message="ورود با موفقیت انجام شد!" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Error Toast</p>
              <Toast type="error" message="ایمیل یا رمز عبور اشتباه است." />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Info Toast</p>
              <Toast type="info" message="کد تایید به ایمیل شما ارسال شد." />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Inline Error Message</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">کد نادرست است. دوباره تلاش کنید.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Modal */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">مودال (Modal)</h3>
          <Button onClick={() => setShowModal(true)}>نمایش مودال</Button>
          
          <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4">عنوان مودال</h3>
              <p className="text-gray-600 mb-6">
                این یک مودال نمونه است که برای نمایش محتوا استفاده می‌شود.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => setShowModal(false)}>
                  تایید
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  انصراف
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Typography & Spacing */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">تایپوگرافی و فاصله‌گذاری</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">سیستم فاصله‌گذاری: 8pt (8px base)</p>
              <div className="flex gap-2 items-end">
                <div className="w-2 h-2 bg-blue-500"></div>
                <div className="w-4 h-4 bg-blue-500"></div>
                <div className="w-6 h-6 bg-blue-500"></div>
                <div className="w-8 h-8 bg-blue-500"></div>
                <div className="w-12 h-12 bg-blue-500"></div>
                <div className="w-16 h-16 bg-blue-500"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">8px, 16px, 24px, 32px, 48px, 64px</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">سلسله‌مراتب متن:</p>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">عنوان اصلی (Heading 1)</h1>
                <h2 className="text-2xl font-bold">عنوان دوم (Heading 2)</h2>
                <h3 className="text-xl font-bold">عنوان سوم (Heading 3)</h3>
                <p className="text-base text-gray-700 font-medium">متن معمولی (Body - Medium)</p>
                <p className="text-base text-gray-600">متن معمولی (Body - Regular)</p>
                <p className="text-sm text-gray-500">متن کوچک (Small Text)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">پالت رنگی</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">Primary (Blue)</p>
              <div className="flex gap-2">
                <div className="flex-1 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-sm">50</div>
                <div className="flex-1 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-sm">100</div>
                <div className="flex-1 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-sm text-white">500</div>
                <div className="flex-1 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-sm text-white">600</div>
                <div className="flex-1 h-16 bg-blue-700 rounded-lg flex items-center justify-center text-sm text-white">700</div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Neutral (Gray)</p>
              <div className="flex gap-2">
                <div className="flex-1 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-sm">50</div>
                <div className="flex-1 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm">100</div>
                <div className="flex-1 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-sm">300</div>
                <div className="flex-1 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-sm text-white">600</div>
                <div className="flex-1 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-sm text-white">800</div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Semantic Colors</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-green-500 rounded-lg flex items-center justify-center text-white">Success</div>
                <div className="h-16 bg-red-500 rounded-lg flex items-center justify-center text-white">Error</div>
                <div className="h-16 bg-yellow-500 rounded-lg flex items-center justify-center text-white">Warning</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}