import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M15.5 9.5a2.3 2.3 0 0 0-2.3-2.3c-1.4 0-2.5 1-2.5 3.5v5.5" />
    <path d="M13 18h-1.5a2.5 2.5 0 0 1-2.5-2.5V10" />
    <path d="M10 9H8" />
  </svg>
);
