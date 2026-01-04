import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  revealable?: boolean;
  trailing?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  className = '',
  id,
  revealable = false,
  trailing,
  ...rest
}: InputProps) {
  const inputId = id ?? React.useId();
  const [reveal, setReveal] = React.useState(false);
  const isPassword = rest.type === 'password';
  const inputType = isPassword && revealable ? (reveal ? 'text' : 'password') : rest.type;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center">
        <input
          id={inputId}
          className={`flex-1 rounded-lg border-2 px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-gray-400 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50'
              : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
          } ${className}`}
          {...rest}
          type={inputType}
        />
        {trailing ? (
          <div className="ml-2">{trailing}</div>
        ) : (
          isPassword && revealable && (
            <button
              type="button"
              onClick={() => setReveal((s) => !s)}
              className="ml-6 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
              aria-label={reveal ? 'Hide password' : 'Show password'}
            >
              {reveal ? 'مخفی' : 'نمایش'}
            </button>
          )
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
