import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen" dir="rtl">
      <div className="p-4">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← بازگشت به صفحه اصلی
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
