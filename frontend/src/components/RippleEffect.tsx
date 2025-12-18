import { useEffect, useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export default function RippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now()
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 1000);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2 border-blue-400 dark:border-blue-300 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
}
