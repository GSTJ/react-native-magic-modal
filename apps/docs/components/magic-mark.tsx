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
    <rect fill="#151411" height="36" rx="11" width="36" x="2" y="2" />
    <path
      d="M10 13.5a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v13"
      stroke="#756F65"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M8 19.5a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4V28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-8.5Z"
      fill="#F3EEE4"
    />
    <path
      d="M16 20.5h8"
      stroke="#151411"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <circle cx="30" cy="10" fill="#FF6342" r="2.5" />
  </svg>
);
