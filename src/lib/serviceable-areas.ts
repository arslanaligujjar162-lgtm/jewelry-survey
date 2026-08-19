/**
 * Placeholder courier coverage list. Swap for a live courier-API lookup
 * (postal code / city serviceability) before launch.
 */
export interface ServiceableArea {
  city: string;
  postalCodePrefixes: string[];
  deliveryDays: string;
  deliveryFee: number;
}

export const SERVICEABLE_AREAS: ServiceableArea[] = [
  { city: "Lahore", postalCodePrefixes: ["54", "55"], deliveryDays: "1-2 business days", deliveryFee: 200 },
  { city: "Karachi", postalCodePrefixes: ["74", "75"], deliveryDays: "2-3 business days", deliveryFee: 250 },
  { city: "Islamabad", postalCodePrefixes: ["44", "45"], deliveryDays: "1-2 business days", deliveryFee: 200 },
  { city: "Rawalpindi", postalCodePrefixes: ["46"], deliveryDays: "1-2 business days", deliveryFee: 200 },
  { city: "Faisalabad", postalCodePrefixes: ["38"], deliveryDays: "2-3 business days", deliveryFee: 250 },
  { city: "Multan", postalCodePrefixes: ["60"], deliveryDays: "2-3 business days", deliveryFee: 250 },
  { city: "Peshawar", postalCodePrefixes: ["25"], deliveryDays: "3-4 business days", deliveryFee: 300 },
  { city: "Quetta", postalCodePrefixes: ["87"], deliveryDays: "4-5 business days", deliveryFee: 350 },
  { city: "Sialkot", postalCodePrefixes: ["51"], deliveryDays: "2-3 business days", deliveryFee: 250 },
  { city: "Gujranwala", postalCodePrefixes: ["52"], deliveryDays: "2-3 business days", deliveryFee: 250 },
];

export const DEFAULT_DELIVERY_FEE = 250;
export const FREE_DELIVERY_THRESHOLD = 6000;

export function checkServiceability(city: string, postalCode: string): ServiceableArea | null {
  const normalizedCity = city.trim().toLowerCase();
  const area = SERVICEABLE_AREAS.find((a) => a.city.toLowerCase() === normalizedCity);
  if (!area) return null;

  const code = postalCode.trim();
  const matchesPrefix = area.postalCodePrefixes.some((prefix) => code.startsWith(prefix));
  return matchesPrefix ? area : null;
}

export function isCityKnown(city: string): boolean {
  return SERVICEABLE_AREAS.some((a) => a.city.toLowerCase() === city.trim().toLowerCase());
}
