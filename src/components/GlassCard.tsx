import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = true, onClick }) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/70 backdrop-blur-xl
        border border-white/50
        shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        ${hover ? 'hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:bg-white/80 hover:border-white/60' : ''}
        transition-all duration-300
        ${className}
      `}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
