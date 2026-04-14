import React from 'react';

export const CurvyLines = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
    {/* Soft Abstract Blob 1 */}
    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[#D1624E]/5 to-transparent rounded-full blur-[120px]" />
    
    {/* Soft Abstract Blob 2 */}
    <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[#6B6B6B]/5 to-transparent rounded-full blur-[100px]" />

    {/* Elegant subtle lines (Grainy texture simulation) */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

export const PaintSplash = ({ className }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-[0.4] transition-all duration-1000 ${className}`}>
     {/* Soft Paper Elevation Effect */}
     <div className="w-full h-full rounded-[40px] bg-white border border-[#E6E1D6] shadow-sm transform rotate-3" />
  </div>
);

export const BlueprintGrid = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.015]">
    {/* Minimal dots instead of hard grid */}
    <div style={{ 
      backgroundImage: 'radial-gradient(#1B1B1B 0.5px, transparent 0.5px)', 
      backgroundSize: '32px 32px' 
    }} className="w-full h-full" />
  </div>
);
