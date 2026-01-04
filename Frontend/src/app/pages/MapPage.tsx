import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { LoginRequiredModal } from "../components/screens/LoginRequiredModal";
import { useAuth } from "../auth/AuthProvider";

export default function MapPage() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCreateItem = () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    // TODO: open create-item form on selected map position
    alert("اینجا فرم ثبت آیتم باز می‌شود (در فاز بعدی)");
  };

  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <div>
          <h2 className="text-3xl font-bold mb-2">نقشه دانشگاه</h2>
          <p className="text-gray-600">
            اینجا نقشه تعاملی و پین‌ها نمایش داده می‌شوند. (فعلاً نمونه)
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateItem}>
          ثبت مورد جدید
        </Button>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[520px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center px-6">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="font-medium">Map Placeholder</p>
            <p className="text-sm text-gray-600 mt-1">
              در فاز بعدی: Leaflet/Mapbox + پین‌ها + فیلترها + جستجو
            </p>
          </div>
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
              گمشده
            </span>
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
              پیدا شده
            </span>
            <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full">
              فیلتر بر اساس تگ
            </span>
            <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full">
              جستجو متنی
            </span>
          </div>
        </div>
      </div>

      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
