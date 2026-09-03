import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ring Sizing Guide",
  description: "Find your ring size at home: a US size chart with diameter and circumference, plus two ways to measure.",
  alternates: { canonical: "/sizing-guide" },
};

const SIZE_CHART = [
  { us: "5", diameter: 15.7, circumference: 49.3 },
  { us: "5.5", diameter: 16.1, circumference: 50.6 },
  { us: "6", diameter: 16.5, circumference: 51.9 },
  { us: "6.5", diameter: 16.9, circumference: 53.1 },
  { us: "7", diameter: 17.3, circumference: 54.4 },
  { us: "7.5", diameter: 17.7, circumference: 55.7 },
  { us: "8", diameter: 18.1, circumference: 57.0 },
  { us: "8.5", diameter: 18.5, circumference: 58.3 },
  { us: "9", diameter: 18.9, circumference: 59.5 },
];

export default function SizingGuidePage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">Sizing guide</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
          Find your ring size
        </h1>
        <p className="mt-4 font-body text-base text-brand-charcoal/80">
          Most of our rings run US 5-9. Each product page lists the exact sizes we have in stock. Two ways to find
          yours, both doable at home.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop?category=rings"
            className="inline-flex items-center justify-center rounded-full shadow-retro-sm bg-brand-umber px-8 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24] active:translate-y-0 active:shadow-none"
          >
            Shop rings
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-umber/10 p-5">
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Method 1: measure a ring you own</h2>
            <p className="mt-2 font-body text-sm text-brand-charcoal/80">
              Measure the inside diameter of a ring that already fits, in millimetres, with a ruler. Match it to the
              chart below.
            </p>
          </div>
          <div className="rounded-xl border border-brand-umber/10 p-5">
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Method 2: measure your finger</h2>
            <p className="mt-2 font-body text-sm text-brand-charcoal/80">
              Wrap a strip of paper or string around your finger, mark where it overlaps, and measure that length in
              millimetres. Match it to the circumference column.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-brand-umber/10">
          <table className="w-full text-left font-body text-sm">
            <caption className="sr-only">Ring size chart: US size to diameter and circumference in millimetres</caption>
            <thead className="bg-brand-sky/10">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-brand-umber-dark">
                  US size
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-brand-umber-dark">
                  Diameter (mm)
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-brand-umber-dark">
                  Circumference (mm)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-umber/10">
              {SIZE_CHART.map((row) => (
                <tr key={row.us}>
                  <td className="px-4 py-3 font-medium text-brand-charcoal">{row.us}</td>
                  <td className="px-4 py-3 text-brand-charcoal/80">{row.diameter}</td>
                  <td className="px-4 py-3 text-brand-charcoal/80">{row.circumference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-body text-sm text-brand-charcoal/70">
          Between sizes, or unsure? WhatsApp us a photo of your measurement and we&apos;ll help you pick.
        </p>
      </div>
    </div>
  );
}
