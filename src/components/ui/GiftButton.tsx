import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GiftButtonProps {
  scrolled: boolean;
}

export const GiftButton: React.FC<GiftButtonProps> = ({ scrolled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/gift');
  };

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 overflow-visible cursor-pointer ${
        scrolled 
          ? 'text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 ring-1 ring-stone-200 hover:ring-stone-300' 
          : 'text-white hover:text-white bg-white/20 hover:bg-white/30 ring-1 ring-white/30 hover:ring-white/40'
      }`}
    >
      {/* Subtle Shine Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <motion.div
          animate={{ 
            scale: isHovered ? [1, 1.2, 1] : 1,
            rotate: isHovered ? [0, -5, 5, 0] : 0
          }}
          transition={{ 
            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
            rotate: { duration: 0.5 }
          }}
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-300 ${
              isHovered ? 'text-red-500 fill-red-500' : 'currentColor'
            }`} 
          />
        </motion.div>
        
        {/* Floating Sparkles - Repositioned */}
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -8, x: 8 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute -top-1 -right-1 text-yellow-400"
              >
                <Sparkles className="w-3 h-3 fill-yellow-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -6, x: -6 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute -top-1 -left-1 text-yellow-400"
              >
                <Sparkles className="w-2 h-2 fill-yellow-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 6, x: -4 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="absolute -bottom-1 left-0 text-yellow-400"
              >
                <Sparkles className="w-2.5 h-2.5 fill-yellow-400" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      
      <span className="relative z-10">Gift A Sub</span>
    </motion.button>
  );
};
