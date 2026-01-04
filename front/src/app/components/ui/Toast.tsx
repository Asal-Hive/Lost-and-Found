import { CircleCheck, CircleX, CircleAlert, X } from 'lucide-react';

interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export function Toast({ type = 'info', message, onClose }: ToastProps) {
  const icons = {
    success: <CircleCheck className="w-5 h-5 text-green-500" />,
    error: <CircleX className="w-5 h-5 text-red-500" />,
    info: <CircleAlert className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColors[type]} min-w-[300px] max-w-md`}
    >
      {icons[type]}
      <p className="flex-1 text-gray-800">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}