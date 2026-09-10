/**
 * A repeating semicircle-bump seam between two differently-colored bands —
 * the scalloped edge of a 70s poster or festival bunting, not a straight
 * hairline. `fromColor` is the band above (the color of the bumps),
 * `toColor` is the band below (the strip's fill).
 */
export function ScallopDivider({
  fromColor,
  toColor,
  className = "",
}: {
  fromColor: string;
  toColor: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`h-4 w-full sm:h-6 ${className}`}
      style={{
        backgroundColor: toColor,
        backgroundImage: `radial-gradient(circle at 14px 0, ${fromColor} 0 14px, transparent 14.5px)`,
        backgroundSize: "28px 28px",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "top center",
      }}
    />
  );
}
