/**
 * Real delivery pricing and timelines, provided by the business.
 * Every address in Pakistan is deliverable via COD — there's no
 * unserviceable-area rejection, only a fee/timeline split:
 *   - Punjab: Rs 350. Central Punjab ships in 2-3 business days; the
 *     rest of the province (upper/Potohar and lower/southern belts)
 *     in 4-5.
 *   - Every other province/territory: Rs 400, in 5-6 business days.
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
  const fee = isPunjab ? 350 : 400;
  if (!isPunjab) return { fee, days: "5-6 business days" };

  const isCentral = CENTRAL_PUNJAB_CITIES.includes(city.trim().toLowerCase());
  return { fee, days: isCentral ? "2-3 business days" : "4-5 business days" };
}
