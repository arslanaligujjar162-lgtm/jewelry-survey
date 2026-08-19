import { z } from "zod";

export const PK_PHONE_REGEX = /^(\+92|0092|0)?3\d{9}$/;

export function normalizePkPhone(raw: string): string {
  const digits = raw.replace(/[\s-]/g, "");
  const match = digits.match(PK_PHONE_REGEX);
  if (!match) return digits;
  const local = digits.replace(/^(\+92|0092|0)/, "");
  return `+92${local}`;
}

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(PK_PHONE_REGEX, "Enter a valid Pakistani mobile number, e.g. 03001234567"),
  addressLine1: z.string().trim().min(5, "Enter your street address"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city"),
  postalCode: z.string().trim().min(4, "Enter a valid postal code"),
  province: z.string().trim().min(2, "Select your province"),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;
