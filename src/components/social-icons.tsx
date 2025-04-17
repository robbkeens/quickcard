import * as React from 'react';

export const LinkedInIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({className, size = 24, ...props}, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
));
LinkedInIcon.displayName = 'LinkedInIcon';

export const TwitterIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({className, size = 24, ...props}, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 1 2.8 3.5 2.8 6.1 0 6.7-5.9 12-13 12C2.9 22 1 16.7 1 10c0-3.2 1.3-5.6 3.4-7.4C5.1 2 10 2 10 2c3.7 0 5.8 2.6 5.8 5.6 0 1.5-.7 3-2.2 3.9v.1c1.5 1 2.8 3 2.8 5.1 0 3.3-2.5 5.5-6.7 5.5-1.3 0-2.6-.7-3.5-1.8 1.3 0 2.5.5 3.4 1.2L2 4z" />
  </svg>
));
TwitterIcon.displayName = 'TwitterIcon';
