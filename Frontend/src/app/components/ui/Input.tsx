import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`w-full rounded-lg border-2 px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-gray-400 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50'
            : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
        } ${className}`}
        {...rest}
      />

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
