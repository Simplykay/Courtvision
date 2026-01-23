
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="url(#logo_gradient)" />
      
      {/* Vision/Eye Outline Background */}
      <path d="M32 13C18 13 6 32 6 32C6 32 18 51 32 51C46 51 58 32 58 32C58 32 46 13 32 13Z" fill="white" fillOpacity="0.1" />
      <path d="M32 13C18 13 6 32 6 32C6 32 18 51 32 51C46 51 58 32 58 32C58 32 46 13 32 13Z" stroke="white" strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Central Basketball Iris */}
      <circle cx="32" cy="32" r="15" fill="#E11D48" stroke="white" strokeWidth="2" />
      
      {/* Basketball Markings */}
      <path d="M32 17V47" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 32H47" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Curved Lines */}
      <path d="M42 23C39 28 39 36 42 41" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 23C25 28 25 36 22 41" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* Lens Reflection */}
      <ellipse cx="32" cy="22" rx="8" ry="4" fill="white" fillOpacity="0.25" />

      <defs>
        <linearGradient id="logo_gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#881337" />
        </linearGradient>
      </defs>
    </svg>
  );
};
