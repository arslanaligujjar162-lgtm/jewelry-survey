import Image from "next/image";
import { BRAND_NAME } from "@/lib/brand";

const LOCKUPS = {
  // Retro Sky Blue textured background, Pale Butter Yellow numerals — the primary mark.
  primary: { src: "/brand/logo-primary.png", alt: "1720 numeral mark" },
  // Umber Brown on Pale Butter Yellow — light surfaces / packaging interior.
  light: { src: "/brand/logo-light.png", alt: "1720 numeral mark" },
  // Pale Butter Yellow on Umber Brown — dark surfaces.
  dark: { src: "/brand/logo-dark.png", alt: "1720 numeral mark" },
  // Pure black, single-ink print (thermal COD slips, engraving, stamps).
  mono: { src: "/brand/logo-mono.png", alt: "1720 numeral mark" },
} as const;

type LockupVariant = keyof typeof LOCKUPS;

export function LogoMark({
  size = 40,
  className = "",
  variant = "light",
}: {
  size?: number;
  className?: string;
  variant?: LockupVariant;
}) {
  const lockup = LOCKUPS[variant];
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-[22%] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={lockup.src} alt={lockup.alt} width={size} height={size} className="h-full w-full object-cover" />
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={44} />
      <span className="font-display text-3xl font-bold tracking-tight text-brand-umber-dark">{BRAND_NAME}</span>
    </span>
  );
}
