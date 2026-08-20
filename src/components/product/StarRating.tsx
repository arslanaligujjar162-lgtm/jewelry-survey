"use client";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#B8925A" : "none"} stroke="#B8925A" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.1 6.6.7-5 4.5 1.4 6.6L12 17l-5.9 3.4L7.5 13.8l-5-4.5 6.6-.7L12 2.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarRatingDisplay({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= Math.round(rating)} />
      ))}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
