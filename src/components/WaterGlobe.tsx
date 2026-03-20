import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const C = {
  teal:    [20,  184, 166] as const,
  emerald: [16,  185, 129] as const,
  sky:     [14,  165, 233] as const,
  deep:    [15,  118, 110] as const,
  white:   [255, 255, 255] as const,
  gold:    [251, 191,  36] as const,
};
const rgb  = ([r, g, b]: readonly number[], a = 1) => `rgba(${r},${g},${b},${a})`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function isLand(lat: number, lon: number): boolean {
  if (lat < -65) return true;
  if (lat > -45 && lat < -10 && lon >  113 && lon < 155) return true;
  if (lat >  35 && lat <  72 && lon >  -12 && lon <  40) return true;
  if (lat > -36 && lat <  38 && lon >  -18 && lon <  52) return true;
  if (lat >  15 && lat <  72 && lon > -170 && lon < -50) return true;
  if (lat > -56 && lat <  14 && lon >  -82 && lon < -34) return true;
  if (lat >   5 && lat <  78 && lon >   25 && lon < 180) return true;
  if (lat > -10 && lat <   8 && lon >   95 && lon < 145) return true;
  return false;
}

const N   = 900;
const PHI = Math.PI * (3 - Math.sqrt(5));
interface Dot { nx: number; ny: number; nz: number; land: boolean }
const DOTS: Dot[] = Array.from({ length: N }, (_, i) => {
  const ny  = 1 - (i / (N - 1)) * 2;
  const r   = Math.sqrt(Math.max(0, 1 - ny * ny));
  const ang = PHI * i;
  const nx  = Math.cos(ang) * r;
  const nz  = Math.sin(ang) * r;
  const lat = Math.asin(ny) * (180 / Math.PI);
  const lon = Math.atan2(nz, nx) * (180 / Math.PI);
  return { nx, ny, nz, land: isLand(lat, lon) };
});

const CITIES = [
  { lat: 51.5,  lon:  -0.1 },
  { lat: 48.9,  lon:   2.3 },
  { lat: 40.7,  lon: -74.0 },
  { lat: 35.7,  lon: 139.7 },
  { lat: -33.9, lon: 151.2 },
  { lat: 28.6,  lon:  77.2 },
  { lat:  1.3,  lon: 103.8 },
  { lat: 43.7,  lon: -79.4 },
];
function cityNormal(lat: number, lon: number) {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return { nx: Math.cos(la) * Math.cos(lo), ny: Math.sin(la), nz: Math.cos(la) * Math.sin(lo) };
}

// ── Sparkle pool ──────────────────────────────────────────────────────────
interface Sparkle { x: number; y: number; life: number; size: number; vx: number; vy: number }
const MAX_SPARKS = 80;

const WaterGlobe: React.FC = () => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number | null>(null);
  const tRef         = useRef(0);
  const mouseTarget  = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });
  const sparks       = useRef<Sparkle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;

    const resize = () => {
      const dpr = Math.max(1, devicePixelRatio);
      canvas.width  = Math.floor(canvas.offsetWidth  * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Graduation cap ────────────────────────────────────────────────
    const drawGradCap = (x: number, y: number, angle: number, sc: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle - Math.PI / 4); // orient the diamond nicely
      ctx.globalAlpha = alpha;
      const s = sc;

      // Halo glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 24);
      glow.addColorStop(0, rgb(C.teal, 0.3));
      glow.addColorStop(1, rgb(C.teal, 0));
      ctx.beginPath(); ctx.arc(0, 0, s * 24, 0, Math.PI * 2);
      ctx.fillStyle = glow; ctx.fill();

      // Drop shadow under board
      ctx.save(); ctx.translate(s * 1.4, s * 1.4);
      ctx.beginPath();
      ctx.moveTo(0, -s * 13); ctx.lineTo(s * 13, 0);
      ctx.lineTo(0, s * 13);  ctx.lineTo(-s * 13, 0);
      ctx.closePath();
      ctx.fillStyle = rgb(C.deep, 0.28); ctx.fill();
      ctx.restore();

      // Board face
      ctx.beginPath();
      ctx.moveTo(0, -s * 13); ctx.lineTo(s * 13, 0);
      ctx.lineTo(0, s * 13);  ctx.lineTo(-s * 13, 0);
      ctx.closePath();
      ctx.fillStyle = rgb(C.teal, 0.88); ctx.fill();
      ctx.strokeStyle = rgb(C.white, 0.5); ctx.lineWidth = 1; ctx.stroke();

      // Highlight streak across board
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(-s * 14, -s * 5); ctx.lineTo(s * 5, -s * 14);
      ctx.lineTo(s * 14, -s * 3); ctx.lineTo(-s * 3, s * 5);
      ctx.closePath();
      ctx.fillStyle = rgb(C.white, 0.12); ctx.fill();
      ctx.restore();

      // Cap body (cylinder base, visible below board)
      ctx.beginPath();
      ctx.ellipse(0, s * 5, s * 5, s * 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgb(C.deep, 0.7); ctx.fill();
      ctx.strokeStyle = rgb(C.teal, 0.4); ctx.lineWidth = 0.6; ctx.stroke();

      // Centre button on board
      ctx.beginPath(); ctx.arc(0, 0, s * 3, 0, Math.PI * 2);
      ctx.fillStyle = rgb(C.white, 0.95); ctx.fill();

      // Tassel cord
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 5, s * 3, s * 12, s * 10, s * 9, s * 20);
      ctx.strokeStyle = rgb(C.gold, 0.9);
      ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();

      // Tassel fringe
      for (let i = 0; i < 6; i++) {
        const ta = (i / 6) * Math.PI * 1.1 + Math.PI * 0.45;
        ctx.beginPath();
        ctx.moveTo(s * 9, s * 20);
        ctx.lineTo(s * 9 + Math.cos(ta) * s * 6, s * 20 + Math.sin(ta) * s * 6);
        ctx.strokeStyle = rgb(C.gold, 0.72); ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(s * 9, s * 20, s * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rgb(C.gold, 0.85); ctx.fill();

      ctx.restore();
    };

    // ── Sparkle stars (trail) ─────────────────────────────────────────
    const spawnSparks = (x: number, y: number) => {
      if (sparks.current.length >= MAX_SPARKS || Math.random() > 0.45) return;
      sparks.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        life: 1,
        size: Math.random() * 2.8 + 0.8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
      });
    };

    const drawSparks = () => {
      const arr = sparks.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const sp = arr[i];
        sp.life -= 0.028;
        sp.x += sp.vx; sp.y += sp.vy;
        if (sp.life <= 0) { arr.splice(i, 1); continue; }
        const a = sp.life * sp.life;
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(sp.life * 4);
        ctx.globalAlpha = a;
        // 4-point star
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2;
          const r1 = sp.size, r2 = sp.size * 0.3;
          ctx.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
          ctx.lineTo(Math.cos(ang + Math.PI / 4) * r2, Math.sin(ang + Math.PI / 4) * r2);
        }
        ctx.closePath();
        const col = sp.life > 0.6 ? C.white : (sp.life > 0.3 ? C.teal : C.emerald);
        ctx.fillStyle = rgb(col, 1);
        ctx.fill();
        ctx.restore();
      }
    };

    // ── Orbit ring ────────────────────────────────────────────────────
    const drawRing = (cx: number, cy: number, rx: number, ry: number, half: 'back' | 'front') => {
      ctx.save();
      ctx.beginPath();
      if (half === 'back') {
        ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
        ctx.setLineDash([5, 8]);
        ctx.strokeStyle = rgb(C.teal, 0.2);
      } else {
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
        ctx.strokeStyle = rgb(C.teal, 0.38);
      }
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    // ── Particle globe ────────────────────────────────────────────────
    const drawGlobe = (cx: number, cy: number, radius: number, t: number, rotY: number) => {
      // Atmosphere bloom
      const bloom = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.4);
      bloom.addColorStop(0,   rgb(C.teal, 0.12));
      bloom.addColorStop(0.5, rgb(C.teal, 0.04));
      bloom.addColorStop(1,   rgb(C.teal, 0));
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = bloom; ctx.fill();

      // Faint sphere base
      const base = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius);
      base.addColorStop(0, rgb(C.teal, 0.07));
      base.addColorStop(1, rgb(C.deep, 0.14));
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = base; ctx.fill();

      // Dots
      const cosR = Math.cos(rotY), sinR = Math.sin(rotY);
      const visible = DOTS.map(d => {
        const rx =  d.nx * cosR + d.nz * sinR;
        const ry =  d.ny;
        const rz = -d.nx * sinR + d.nz * cosR;
        const depth = (rz + 1) / 2;
        return { sx: cx + rx * radius, sy: cy - ry * radius, depth, rz, land: d.land };
      }).filter(d => d.rz > -0.12).sort((a, b) => a.depth - b.depth);

      for (const d of visible) {
        if (d.land) {
          const col = d.depth > 0.6 ? C.emerald : C.teal;
          const r   = lerp(0.7, 2.5, d.depth);
          const a   = lerp(0.22, 0.92, d.depth);
          ctx.beginPath(); ctx.arc(d.sx, d.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = rgb(col, a); ctx.fill();
          if (d.depth > 0.72) {
            const g = ctx.createRadialGradient(d.sx, d.sy, 0, d.sx, d.sy, r * 4.5);
            g.addColorStop(0, rgb(C.teal, a * 0.38));
            g.addColorStop(1, rgb(C.teal, 0));
            ctx.beginPath(); ctx.arc(d.sx, d.sy, r * 4.5, 0, Math.PI * 2);
            ctx.fillStyle = g; ctx.fill();
          }
        } else {
          ctx.beginPath(); ctx.arc(d.sx, d.sy, lerp(0.25, 0.85, d.depth), 0, Math.PI * 2);
          ctx.fillStyle = rgb(C.teal, lerp(0.03, 0.2, d.depth)); ctx.fill();
        }
      }

      // City markers
      for (const city of CITIES) {
        const cn = cityNormal(city.lat, city.lon);
        const rx =  cn.nx * cosR + cn.nz * sinR;
        const ry =  cn.ny;
        const rz = -cn.nx * sinR + cn.nz * cosR;
        if (rz < 0.12) continue;
        const sx = cx + rx * radius, sy = cy - ry * radius;
        const depth = (rz + 1) / 2;
        const pulse = Math.sin(t * 2.2 + city.lat) * 0.5 + 0.5;
        // Ping ring
        ctx.beginPath(); ctx.arc(sx, sy, lerp(3, 8, pulse), 0, Math.PI * 2);
        ctx.strokeStyle = rgb(C.emerald, lerp(0.45, 0, pulse) * depth);
        ctx.lineWidth = 0.9; ctx.stroke();
        // Dot
        ctx.beginPath(); ctx.arc(sx, sy, lerp(1.5, 2.8, depth), 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.white, 0.88 * depth); ctx.fill();
      }

      // Fresnel rim
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
      rim.addColorStop(0,   rgb(C.teal, 0));
      rim.addColorStop(0.6, rgb(C.teal, 0.05));
      rim.addColorStop(1,   rgb(C.teal, 0.5));
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = rim; ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(C.teal, 0.52); ctx.lineWidth = 1.5; ctx.stroke();

      // Specular
      const spec = ctx.createRadialGradient(cx - radius * 0.32, cy - radius * 0.38, 0, cx - radius * 0.32, cy - radius * 0.38, radius * 0.5);
      spec.addColorStop(0, 'rgba(255,255,255,0.33)');
      spec.addColorStop(0.4, 'rgba(255,255,255,0.1)');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();
    };

    // ── Main draw loop ─────────────────────────────────────────────────
    const draw = () => {
      tRef.current += 0.0085;
      const t = tRef.current;

      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.055;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.055;

      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (w < 10 || h < 10) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);

      const mx = (mouseCurrent.current.x - 0.5) * 12;
      const my = (mouseCurrent.current.y - 0.5) * 12;
      const cx = w / 2 + mx;
      const cy = h / 2 + my + Math.sin(t * 0.5) * 4;
      const radius = Math.min(w, h) * 0.27;

      const tilt    = Math.PI / 5.5;
      const speed   = t * 0.44;
      const orbitRx = radius * 1.44;
      const orbitRy = orbitRx * Math.abs(Math.sin(tilt));

      // Cap 3-D position on orbit
      const capX3 =  orbitRx * Math.sin(speed);
      const capY3 = -orbitRx * Math.sin(tilt) * Math.cos(speed);
      const capZ3 =  orbitRx * Math.cos(tilt)  * Math.cos(speed);
      const capFront = capZ3 > 0;

      // Heading = tangent direction
      const tanX   =  orbitRx * Math.cos(speed);
      const tanY   =  orbitRx * Math.sin(tilt) * Math.sin(speed);
      const heading = Math.atan2(tanY, tanX);

      const depth01  = 0.65 + 0.35 * (capZ3 / orbitRx);
      const capAlpha = capFront ? 0.92 : 0.5;
      const capScale = radius * 0.055 * depth01;

      const rotY = t * 0.17 + (mouseCurrent.current.x - 0.5) * 0.45;

      // Spawn sparkles at cap position
      spawnSparks(cx + capX3, cy + capY3);

      // ── Draw order ──
      drawRing(cx, cy, orbitRx, orbitRy, 'back');

      if (!capFront) {
        drawSparks();
        drawGradCap(cx + capX3, cy + capY3, heading, capScale, capAlpha);
      }

      drawGlobe(cx, cy, radius, t, rotY);

      if (capFront) {
        drawSparks();
        drawGradCap(cx + capX3, cy + capY3, heading, capScale, capAlpha);
      }

      drawRing(cx, cy, orbitRx, orbitRy, 'front');

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseTarget.current = {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top)  / r.height)),
    };
  };

  return (
    <motion.div
      className="relative w-[22rem] h-[22rem] md:w-[30rem] md:h-[30rem]"
      onPointerMove={onMove}
      onPointerLeave={() => { mouseTarget.current = { x: 0.5, y: 0.5 }; }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 0 30px rgba(20,184,166,0.28)) drop-shadow(0 10px 36px rgba(14,165,233,0.13))' }}
      />
    </motion.div>
  );
};

export default WaterGlobe;
