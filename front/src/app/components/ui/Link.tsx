interface LinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function Link({ children, onClick, className = '', disabled = false }: LinkProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-blue-500 hover:text-blue-600 active:text-blue-700 transition-colors underline-offset-2 hover:underline ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
}
