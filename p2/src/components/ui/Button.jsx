import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false,
  isLoading = false 
}) => {
  const variants = {
    primary: 'bg-royalPurple text-white hover:bg-deepViolet border-transparent',
    secondary: 'bg-transparent border-2 border-softGold text-softGold hover:bg-softGold hover:text-white',
    outline: 'bg-transparent border-2 border-royalPurple text-royalPurple hover:bg-royalPurple hover:text-white',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    gold: 'bg-softGold text-richBlack font-bold hover:bg-mutedGold border-transparent'
  };

  const baseStyles = 'px-6 py-3 rounded-full transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : children}
    </motion.button>
  );
};

export default Button;
