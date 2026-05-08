'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SavingsBadgeProps {
  amount: number;
  className?: string;
  animated?: boolean;
}

export const SavingsBadge: React.FC<SavingsBadgeProps> = ({ 
  amount, 
  className = "", 
  animated = true 
}) => {
  const badgeContent = (
    <span 
      className={`absolute top-1/2 -translate-y-1/2 -right-20 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-medium ${className}`}
    >
      Save ${amount}
    </span>
  );

  if (animated) {
    return (
      <motion.span
        className={`absolute top-1/2 -translate-y-1/2 -right-20 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-medium ${className}`}
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Save ${amount}
      </motion.span>
    );
  }

  return badgeContent;
};