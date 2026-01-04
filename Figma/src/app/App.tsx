import { useState } from 'react';
import FlowPage from './components/FlowPage';
import ComponentsPage from './components/ComponentsPage';
import ScreensPage from './components/ScreensPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'flow' | 'components' | 'screens'>('flow');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">L&F</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Lost & Found UI Kit</h1>
                <p className="text-xs text-gray-500">مجموعه کامل احراز هویت</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('flow')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'flow'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Flow
              </button>
              <button
                onClick={() => setCurrentPage('components')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'components'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setCurrentPage('screens')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'screens'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Screens
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="py-8">
        {currentPage === 'flow' && <FlowPage />}
        {currentPage === 'components' && <ComponentsPage />}
        {currentPage === 'screens' && <ScreensPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              🎓 Lost & Found Authentication UI Kit - برای سیستم گم‌وگور دانشگاهی
            </p>
            <p className="text-xs text-gray-500">
              React + Tailwind CSS + RTL Support | Backend: Django + DRF
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}