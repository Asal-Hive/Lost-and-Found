import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import logo from "../../assets/44ef5f3c1c67b3d1d525bbc9fa0e74b73389b94f.png";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg font-medium transition-colors ${
          isActive
            ? "bg-blue-500 text-white shadow-sm"
            : "text-slate-200 hover:bg-white/10"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-[2000] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-white flex items-center justify-center ring-1 ring-white/20">
                <img
                  src={logo}
                  alt="Lost & Found Asal Hive"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">Lost & Found</h1>
                <p className="text-xs text-slate-300">سامانه گم‌شده‌ها و پیدا‌شده‌ها دانشگاه</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavItem to="/">نقشه</NavItem>
              <NavItem to="/items">آیتم‌ها</NavItem>
              <NavItem to="/chat">چت‌بات</NavItem>

              <div className="w-px h-8 bg-white/15 mx-1" />

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-200 hidden sm:block">
                    {user?.email}
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-lg font-medium transition-colors text-slate-200 hover:bg-white/10"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <>
                  <NavItem to="/login">ورود</NavItem>
                  <NavItem to="/signup">ثبت‌نام</NavItem>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">🍯 Lost & Found | Asal Hive 🎓 </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
