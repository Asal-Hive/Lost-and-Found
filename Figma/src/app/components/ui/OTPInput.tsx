import { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export function OTPInput({ length = 6, value = '', onChange, error = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      setOtp(value.split('').concat(Array(length - value.length).fill('')));
    }
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (onChange) {
      onChange(newOtp.join(''));
    }

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
    setOtp(newOtp);

    if (onChange) {
      onChange(pastedData);
    }

    const nextEmptyIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" dir="ltr">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`w-12 h-14 text-center text-xl font-semibold rounded-lg border-2 transition-all duration-200 outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50'
              : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
          }`}
        />
      ))}
    </div>
  );
}
