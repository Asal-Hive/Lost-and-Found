import React from "react";
import { Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";

import MapPage from "./pages/MapPage";
import ItemsPage from "./pages/ItemsPage";
import ChatbotPage from "./pages/ChatbotPage";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetOTPPage from "./pages/auth/ResetOTPPage";
import SetNewPasswordPage from "./pages/auth/SetNewPasswordPage";

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-3">🚫</div>
        <h2 className="text-2xl font-bold mb-2">صفحه پیدا نشد</h2>
        <p className="text-gray-600">آدرس را بررسی کنید.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Main app */}
      <Route element={<PublicLayout />}>
        <Route index element={<MapPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="chat" element={<ChatbotPage />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="set-password" element={<SetPasswordPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-otp" element={<ResetOTPPage />} />
        <Route path="set-new-password" element={<SetNewPasswordPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
