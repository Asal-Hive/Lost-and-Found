import * as React from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const id = React.useId();

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 select-none ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-5 w-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-4 focus:ring-blue-50"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
