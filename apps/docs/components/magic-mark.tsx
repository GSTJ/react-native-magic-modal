export const MagicMark = ({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 40 40"
    width={size}
  >
    <defs>
      <linearGradient id="magic-mark-gradient" x1="5" x2="35" y1="4" y2="36">
        <stop stopColor="#9B87F5" />
        <stop offset=".48" stopColor="#6E56CF" />
        <stop offset="1" stopColor="#42D3A5" />
      </linearGradient>
    </defs>
    <rect
      fill="url(#magic-mark-gradient)"
      height="36"
      rx="12"
      width="36"
      x="2"
      y="2"
    />
    <path
      d="m12 28 4.6-15.7c.35-1.18 1.98-1.28 2.46-.15L22 19l6.58-2.5c1.2-.46 2.14.98 1.31 1.96L21.2 28.7c-.75.89-2.2.29-2.1-.87l.45-5.18-5.9 6.6c-.7.78-1.95-.24-1.65-1.25Z"
      fill="white"
    />
    <circle cx="29" cy="10.5" fill="#D9FFF3" r="2.2" />
  </svg>
);
