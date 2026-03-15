import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const WaterGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.4;

      ctx.clearRect(0, 0, w, h);

      // Draw globe with water effect
      const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
      gradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
      gradient.addColorStop(0.3, 'rgba(50, 150, 220, 0.8)');
      gradient.addColorStop(0.6, 'rgba(30, 100, 180, 0.7)');
      gradient.addColorStop(1, 'rgba(10, 50, 120, 0.6)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Water ripple effect based on mouse
      const rippleX = cx + (mousePos.x - 0.5) * radius * 0.5;
      const rippleY = cy + (mousePos.y - 0.5) * radius * 0.5;

      for (let i = 0; i < 5; i++) {
        const rippleRadius = (radius * 0.2) + (i * 30) + Math.sin(t * 2 - i * 0.5) * 20;
        const alpha = 0.3 - i * 0.05;
        ctx.beginPath();
        ctx.arc(rippleX, rippleY, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw continents (simplified)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const drawContinent = (x: number, y: number, size: number, rotation: number) => {
        const offsetX = Math.sin(t * 0.3) * 20;
        const actualX = cx + x + offsetX;
        const actualY = cy + y;
        
        ctx.save();
        ctx.translate(actualX, actualY);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.5, size, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 180, 100, 0.6)';
        ctx.fill();
        ctx.restore();
      };

      // Simplified continents
      drawContinent(-radius * 0.3, -radius * 0.2, radius * 0.15, 0.3);
      drawContinent(radius * 0.2, -radius * 0.3, radius * 0.2, -0.2);
      drawContinent(-radius * 0.1, radius * 0.2, radius * 0.18, 0.5);
      drawContinent(radius * 0.35, radius * 0.15, radius * 0.12, -0.3);
      drawContinent(-radius * 0.4, radius * 0.05, radius * 0.1, 0.1);

      ctx.restore();

      // Glossy highlight
      const highlightGradient = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx - radius * 0.3, cy - radius * 0.3, radius * 0.6
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Outer glow
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  return (
    <motion.div
      className="relative w-80 h-80 md:w-96 md:h-96"
      onMouseMove={handleMouseMove}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 0 40px rgba(100, 200, 255, 0.5))' }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/50 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </motion.div>
  );
};

export default WaterGlobe;
