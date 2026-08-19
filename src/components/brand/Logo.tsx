export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label="7teen2wenty numeral mark, 1720"
      className={className}
    >
      <rect x="0" y="0" width="96" height="96" rx="22" fill="#8FC6DE" />
      <text
        x="48"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontWeight={700}
        fontSize="34"
        fill="#5C3A21"
      >
        1720
      </text>
      <g fill="#F3E3A6">
        <circle cx="30" cy="74" r="4" />
        <circle cx="48" cy="74" r="4" />
        <circle cx="66" cy="74" r="4" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={36} />
      <span className="font-display text-2xl font-semibold tracking-tight text-brand-umber-dark">
        7teen2wenty
      </span>
    </span>
  );
}
