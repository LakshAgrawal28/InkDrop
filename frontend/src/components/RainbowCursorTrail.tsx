import { useEffect, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export default function RainbowCursorTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    let animationFrame: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now()
      };

      setTrail(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 15 points
        return updated.slice(-15);
      });
    };

    const fadeTrail = () => {
      setTrail(prev => {
        if (prev.length === 0) return prev;
        return prev.slice(1);
      });
      animationFrame = requestAnimationFrame(fadeTrail);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationFrame = requestAnimationFrame(fadeTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {trail.map((point, index) => {
        const colors = [
          'bg-red-400',
          'bg-orange-400', 
          'bg-yellow-400',
          'bg-green-400',
          'bg-blue-400',
          'bg-indigo-400',
          'bg-purple-400'
        ];
        const colorIndex = index % colors.length;
        const opacity = (index / trail.length) * 0.8;
        const size = 8 + (index / trail.length) * 12;

        return (
          <div
            key={point.id}
            className={`absolute rounded-full ${colors[colorIndex]} blur-sm transition-all duration-300`}
            style={{
              left: point.x,
              top: point.y,
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
}
