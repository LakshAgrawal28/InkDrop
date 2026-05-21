import { ReactNode } from 'react';
import './AuroraBackground.css';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export default function AuroraBackground({ children, className = '', fullHeight = false }: AuroraBackgroundProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className={`aurora-container ${fullHeight ? 'full-height' : ''}`}>
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="aurora aurora-3"></div>
      </div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
