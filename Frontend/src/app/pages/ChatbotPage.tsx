import React, { useState } from "react";
import { LabeledInput } from "../components/ui/LabeledInput";
import { Button } from "../components/ui/Button";
import { searchChatbot, ChatbotResult } from "../../services/chatbotApi";
import { Link } from "react-router-dom";

export default function ChatbotPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ChatbotResult[]>([]);
  const [botMessage, setBotMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setBotMessage("");

    try {
      // searchChatbot now returns: { query, message, results }
      const data = await searchChatbot(q, 7);

      setBotMessage(data.message || "");
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError("خطا در جستجوی چت‌بات. لطفا دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s: "lost" | "found") => (s === "lost" ? "گمشده" : "پیدا شده");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" dir="rtl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">چت‌بات پیدا کردن وسایل</h2>
        <p className="text-gray-600">
          یک توضیح کوتاه درباره وسیله گمشده (فارسی یا انگلیسی) بنویسید تا نتایج مرتبط از میان پست‌ها پیدا شود.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <LabeledInput
            label="وسیله‌ام گم شده"
            placeholder="مثال: کیف مشکی با زیپ قرمز نزدیک کتابخانه | black wallet near library"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="primary" className="w-full" disabled={loading}>
            {loading ? "در حال جستجو..." : "جستجو"}
          </Button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!error && botMessage && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800">{botMessage}</p>
          </div>
        )}

        {!error && !loading && results.length === 0 && query.trim() && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-700">
              مورد مرتبطی یافت نشد. یک توضیح دقیق‌تر بنویسید (رنگ، مکان، دسته‌بندی...).
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="text-sm text-gray-600">{results.length} نتیجه مرتبط پیدا شد:</div>

            {results.map((r) => (
              <div
                key={r.id}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      وضعیت: {statusLabel(r.status)} • مکان: {r.location_name || "نامشخص"} • امتیاز: {r.score}
                    </div>
                  </div>

                  <Link
                    to={r.link}
                    className="shrink-0 text-sm px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    مشاهده آیتم
                  </Link>
                </div>

                <div className="text-xs text-gray-500">
                  لینک مستقیم: <span className="font-mono">{r.link}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
