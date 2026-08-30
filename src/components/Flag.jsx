/** Cuban flag — 30x20 SVG: blue stripes, white stripes, crimson triangle, white star */
export default function Flag({ className = '' }) {
  return (
    <svg className={`flag-svg ${className}`} viewBox="0 0 30 20" role="img" aria-label="Cuban flag">
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect y="0" width="30" height="3.33" fill="#002A8F" />
      <rect y="6.67" width="30" height="3.33" fill="#002A8F" />
      <rect y="13.33" width="30" height="3.33" fill="#002A8F" />
      <path d="M0 0 L13.5 10 L0 20 Z" fill="#D90429" />
      <path d="M4.80,6.40 L5.68,8.79 L8.22,8.89 L6.23,10.46 L6.92,12.91 L4.80,11.50 L2.68,12.91 L3.37,10.46 L1.38,8.89 L3.92,8.79 Z" fill="#FFFFFF" />
    </svg>
  );
}