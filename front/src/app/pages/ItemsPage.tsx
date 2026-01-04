import React from "react";

export default function ItemsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">لیست آیتم‌ها</h2>
        <p className="text-gray-600">
          این صفحه در فاز بعدی به API وصل می‌شود و کارت هر آیتم (تصویر، عنوان، تگ‌ها، وضعیت) نمایش داده می‌شود.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-medium">Items Placeholder</p>
          <p className="text-sm text-gray-600 mt-1">
            در فاز بعدی: صفحه جزئیات آیتم + کامنت‌ها + گزارش (Report)
          </p>
        </div>
      </div>
    </div>
  );
}
