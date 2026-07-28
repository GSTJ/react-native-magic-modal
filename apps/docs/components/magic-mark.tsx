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
    viewBox="0 0 48 48"
    width={size}
  >
    <rect fill="#151411" height="44" rx="13" width="44" x="2" y="2" />
    <path
      d="m23.5 6.5-4.2 14.1 10.1-5.1-5.9-9Z"
      fill="#9DF7C7"
      stroke="#151411"
      strokeLinejoin="round"
      strokeWidth="1.4"
    />
    <path
      d="M16.2 20.3c2.9-3.1 6.8-4.5 10.8-3.7 5.7 1.1 9.1 6.2 8 11.8-.9 4.7-5 8.1-9.9 8.1h-9.3c-1.6 0-2.8-1.3-2.8-2.8v-5.4c0-3 .9-5.8 3.2-8Z"
      fill="#FFFDF7"
    />
    <path
      d="m17.1 21.1-5.2-3.4 1.2 7.1"
      fill="#FF4FA3"
      stroke="#151411"
      strokeLinejoin="round"
      strokeWidth="1.4"
    />
    <path
      d="M16.1 22.1c-2.3 2.3-3.4 5.2-3.1 8.9l4.7-2.2-2.1 5.3 5-1.6-1.1 4h5.6c-4-4.2-3.7-10.6-9-14.4Z"
      fill="#7C5CFF"
    />
    <circle cx="29.8" cy="24.8" fill="#151411" r="1.35" />
    <path
      d="M39 7.5c.45 2.55 1.95 4.05 4.5 4.5-2.55.45-4.05 1.95-4.5 4.5-.45-2.55-1.95-4.05-4.5-4.5 2.55-.45 4.05-1.95 4.5-4.5Z"
      fill="#FF4FA3"
    />
    <path
      d="M38.2 28.8c.28 1.6 1.2 2.52 2.8 2.8-1.6.28-2.52 1.2-2.8 2.8-.28-1.6-1.2-2.52-2.8-2.8 1.6-.28 2.52-1.2 2.8-2.8Z"
      fill="#9DF7C7"
    />
  </svg>
);
