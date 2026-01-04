import React, { useState } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function ChatbotPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: connect to backend retrieval + LLM
    setAnswer(`نتایج مرتبط برای «${query}» اینجا نمایش داده می‌شوند...`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">چت‌بات پیدا کردن وسایل</h2>
        <p className="text-gray-600">
          یک توضیح کوتاه درباره وسیله گمشده بنویسید تا نتایج مرتبط از پست‌ها پیشنهاد شود.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="وسیله‌ام گم شده"
            placeholder="مثال: کیف مشکی با زیپ قرمز نزدیک کتابخانه"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="primary" className="w-full">
            جستجو
          </Button>
        </form>

        {answer && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-900">{answer}</p>
            <p className="text-xs text-blue-700 mt-2">
              در فاز بعدی: لینک به صفحه آیتم‌های مشابه + نمایش کارت نتایج
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
