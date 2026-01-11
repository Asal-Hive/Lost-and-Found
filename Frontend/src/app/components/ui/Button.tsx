import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-100',
        secondary:
          'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-100',
        text:
          'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-100',
        outline:
          'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-100',
        ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200',
        destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-100',
      },
      size: {
        default: 'px-4 py-3',
        sm: 'px-3 py-2 text-sm',
        lg: 'px-6 py-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}

export { buttonVariants };
