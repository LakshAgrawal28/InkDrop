import { useEffect, useRef, ReactNode } from 'react';
import VanillaTilt from 'vanilla-tilt';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export default function TiltCard({ 
  children, 
  className = '',
  maxTilt = 10,
  scale = 1.05,
  speed = 400
}: TiltCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tiltNode = tiltRef.current;
    
    if (tiltNode) {
      VanillaTilt.init(tiltNode, {
        max: maxTilt,
        scale: scale,
        speed: speed,
        glare: true,
        'max-glare': 0.3,
      });
    }

    return () => {
      if (tiltNode && (tiltNode as any).vanillaTilt) {
        (tiltNode as any).vanillaTilt.destroy();
      }
    };
  }, [maxTilt, scale, speed]);

  return (
    <div ref={tiltRef} className={className}>
      {children}
    </div>
  );
}
