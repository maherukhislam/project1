import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const WaterGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(canvas.offsetWidth * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const continents = [
      { lat: 30, lon: -20, size: 18 },
      { lat: 10, lon: 40, size: 20 },
      { lat: -20, lon: 80, size: 16 },
      { lat: -10, lon: -120, size: 22 },
      { lat: 35, lon: 120, size: 14 },
      { lat: -35, lon: 20, size: 18 },
      { lat: 5, lon: 150, size: 12 }
    ];

    const drawLand = (cx: number, cy: number, radius: number, rotation: number) => {
      continents.forEach((c, index) => {
        const lat = (c.lat * Math.PI) / 180;
        const lon = ((c.lon + rotation) * Math.PI) / 180;
        const x = radius * Math.cos(lat) * Math.sin(lon);
        const y = -radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.cos(lon);
        if (z < 0) return;
        const depth = z / radius;
        const size = c.size * (0.6 + depth * 0.6);

        ctx.save();
        ctx.translate(cx + x, cy + y);
        ctx.globalAlpha = 0.35 + depth * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.3, size, (index % 3) * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 190, 140, 0.9)';
        ctx.fill();
        ctx.restore();
      });
    };

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.08;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.08;
      const wobbleX = (mouseCurrent.current.x - 0.5) * 24;
      const wobbleY = (mouseCurrent.current.y - 0.5) * 24;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w < 10 || h < 10) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      const cx = w / 2 + wobbleX;
      const cy = h / 2 + wobbleY + Math.sin(t * 0.8) * 6;
      const radius = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      const shadowGradient = ctx.createRadialGradient(cx, cy + radius * 0.9, 0, cx, cy + radius * 0.9, radius * 1.2);
      shadowGradient.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
      shadowGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius * 0.95, radius * 0.85, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = shadowGradient;
      ctx.fill();

      const oceanGradient = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.4,
        radius * 0.2,
        cx,
        cy,
        radius
      );
      oceanGradient.addColorStop(0, 'rgba(120, 210, 255, 0.98)');
      oceanGradient.addColorStop(0.4, 'rgba(35, 140, 210, 0.9)');
      oceanGradient.addColorStop(0.7, 'rgba(20, 90, 160, 0.85)');
      oceanGradient.addColorStop(1, 'rgba(8, 35, 90, 0.9)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGradient;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const rotation = t * 12 + (mouseCurrent.current.x - 0.5) * 30;
      drawLand(cx, cy, radius * 0.92, rotation);

      const rippleX = cx + (mouseCurrent.current.x - 0.5) * radius * 0.6;
      const rippleY = cy + (mouseCurrent.current.y - 0.5) * radius * 0.6;
      for (let i = 0; i < 4; i += 1) {
        const rippleRadius = Math.max(
          0.5,
          radius * (0.25 + i * 0.14) + Math.sin(t * 2 - i * 0.6) * 8
        );
        ctx.beginPath();
        ctx.arc(rippleX, rippleY, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 - i * 0.03})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      ctx.restore();

      const shadeGradient = ctx.createRadialGradient(
        cx + radius * 0.4,
        cy + radius * 0.35,
        radius * 0.2,
        cx,
        cy,
        radius * 1.1
      );
      shadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadeGradient.addColorStop(1, 'rgba(2, 6, 23, 0.35)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = shadeGradient;
      ctx.fill();

      const highlightGradient = ctx.createRadialGradient(
        cx - radius * 0.35 + wobbleX * 0.2,
        cy - radius * 0.4 + wobbleY * 0.2,
        0,
        cx - radius * 0.35,
        cy - radius * 0.4,
        radius * 0.7
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      highlightGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.03, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 220, 255, 0.55)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 220, 255, 0.18)';
      ctx.lineWidth = 6;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseTarget.current = {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    };
  };

  return (
    <motion.div
      className="relative w-80 h-80 md:w-[26rem] md:h-[26rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { mouseTarget.current = { x: 0.5, y: 0.5 }; }}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 24px 50px rgba(6, 182, 212, 0.25))' }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/70 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </motion.div>
  );
};

export default WaterGlobe;


