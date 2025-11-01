import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-8 py-3 font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md';

  const variantStyles = {
    primary: 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/40 focus:ring-red-500',
    secondary: 'bg-white text-red-700 border border-red-300 hover:bg-red-50 focus:ring-red-400 shadow-md',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;