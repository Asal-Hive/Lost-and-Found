import * as React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'text';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-100',
    secondary:
      'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-100',
    text:
      'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-100',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}
