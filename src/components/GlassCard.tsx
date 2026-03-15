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
        relative overflow-hidden rounded-3xl
        bg-white/80 backdrop-blur-2xl
        border border-white/60
        shadow-[0_12px_40px_rgba(15,23,42,0.12)]
        ${hover ? 'hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:bg-white/90 hover:border-white/80' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      whileHover={hover ? { scale: 1.01 } : {}}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_60%)] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;


