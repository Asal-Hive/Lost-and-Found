import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8" dir="rtl">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-3">برای ادامه وارد شوید</h2>
          <p className="text-gray-600">
            مشاهده نقشه آزاد است، اما برای ثبت آیتم یا ارسال کامنت باید وارد شوید.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button variant="primary" className="w-full">
            ورود
          </Button>
          <Button variant="secondary" className="w-full">
            ثبت‌نام
          </Button>
          <button 
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            فعلاً نه
          </button>
        </div>
      </div>
    </Modal>
  );
}
