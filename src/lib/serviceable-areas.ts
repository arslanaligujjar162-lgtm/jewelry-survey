/**
 * Real delivery timelines, provided by the business. Every address in
 * Pakistan is deliverable via COD — there's no unserviceable-area rejection.
 * Delivery is free nationwide (the Wedding Season Sale banner's claim);
 * only the shipping estimate still varies by region:
 *   - Central Punjab: 2-3 business days.
 *   - Rest of Punjab (upper/Potohar and lower/southern belts): 4-5.
 *   - Every other province/territory: 5-6 business days.
 */
const CENTRAL_PUNJAB_CITIES = [
  "lahore",
  "faisalabad",
  "gujranwala",
  "sialkot",
  "sheikhupura",
  "kasur",
  "nankana sahib",
  "gujrat",
  "sahiwal",
  "okara",
  "hafizabad",
  "mandi bahauddin",
  "toba tek singh",
  "jhang",
  "narowal",
];

export interface DeliveryInfo {
  fee: number;
  days: string;
}

export function getDeliveryInfo(province: string, city: string): DeliveryInfo {
  const isPunjab = province.trim().toLowerCase() === "punjab";
  if (!isPunjab) return { fee: 0, days: "5-6 business days" };

  const isCentral = CENTRAL_PUNJAB_CITIES.includes(city.trim().toLowerCase());
  return { fee: 0, days: isCentral ? "2-3 business days" : "4-5 business days" };
}
