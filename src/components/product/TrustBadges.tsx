const BADGES = [
  {
    label: "Cash on Delivery",
    icon: (
      <path d="M2 7h15v10H2V7zm15 3h3l2 3v4h-5v-7zM6 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    ),
  },
  {
    label: "7-day returns",
    icon: <path d="M4 4v6h6M4.5 15a8 8 0 1 0 2-9.3L4 10" fill="none" strokeWidth="1.8" />,
  },
  {
    label: "316L steel, PVD plated",
    icon: <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4z" />,
  },
] as const;

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-3 gap-3 border-y border-brand-umber/10 py-4 ${className}`}>
      {BADGES.map((badge) => (
        <li key={badge.label} className="flex flex-col items-center gap-1.5 text-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className="text-brand-umber-dark" aria-hidden="true">
            {badge.icon}
          </svg>
          <span className="font-body text-[11px] font-medium leading-tight text-brand-charcoal">{badge.label}</span>
        </li>
      ))}
    </ul>
  );
}
