"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPKR } from "@/lib/format";
import { PK_PHONE_REGEX, PAKISTAN_PROVINCES } from "@/lib/validation";
import { getDeliveryInfo } from "@/lib/serviceable-areas";
import { trackEvent, trackPixelEvent } from "@/lib/analytics";

type FieldErrors = Partial<Record<"fullName" | "phone" | "addressLine1" | "city" | "postalCode" | "province", string>>;

export function CheckoutForm() {
  const { lines, subtotal } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<{ valid: boolean; message: string; discountPercent: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const phoneValid = PK_PHONE_REGEX.test(phone.replace(/\s/g, ""));
  const delivery = useMemo(
    () => (province && city.trim() ? getDeliveryInfo(province, city) : null),
    [province, city]
  );

  const discount = promoStatus?.valid ? Math.round((subtotal * promoStatus.discountPercent) / 100) : 0;
  const total = subtotal - discount + (delivery?.fee ?? 0);

  function validateAddress(): boolean {
    const errors: FieldErrors = {};
    if (fullName.trim().length < 3) errors.fullName = "Enter your full name";
    if (!phoneValid) errors.phone = "Enter a valid Pakistani mobile number, e.g. 03001234567";
    if (addressLine1.trim().length < 5) errors.addressLine1 = "Enter your street address";
    if (!city.trim()) errors.city = "Enter your city";
    if (!postalCode.trim()) errors.postalCode = "Enter your postal code";
    if (!province) errors.province = "Select your province";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function sendOtp() {
    if (!phoneValid) {
      setFieldErrors((prev) => ({ ...prev, phone: "Enter a valid Pakistani mobile number, e.g. 03001234567" }));
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send code");
      setOtpSent(true);
      setDevCode(data.devCode ?? null);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtpCode() {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) throw new Error(data.error ?? "Incorrect code");
      setOtpVerified(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Incorrect code");
    } finally {
      setOtpLoading(false);
    }
  }

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      });
      const data = await res.json();
      setPromoStatus(data);
    } catch {
      setPromoStatus({ valid: false, message: "Could not check that code", discountPercent: 0 });
    } finally {
      setPromoLoading(false);
    }
  }

  async function placeOrder() {
    setOrderError(null);
    if (!validateAddress()) return;
    if (!otpVerified) {
      setOrderError("Verify your phone number with the code we sent before placing your order.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: { fullName, phone, addressLine1, addressLine2, city, postalCode, province },
          items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity, ring_size: l.ring_size ?? null })),
          promoCode: promoStatus?.valid ? promoInput : undefined,
          paymentMethod: "cod",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Could not place your order");

      trackEvent("purchase", { transaction_id: data.order.order_number, value: data.order.total, currency: "PKR" });
      trackPixelEvent("Purchase", { value: data.order.total, currency: "PKR" });

      sessionStorage.setItem(`order:${data.order.order_number}`, JSON.stringify(data.order));
      // Cart is cleared by the confirmation page once it has the order in
      // hand, not here — clearing before navigating away would empty
      // `lines` while this page is still mounted, racing its own
      // redirect-if-empty effect against the navigation below.
      router.push(`/order-confirmation/${data.order.order_number}`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Could not place your order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section>
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
            1. Shipping address
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={fieldErrors.fullName} className="sm:col-span-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                autoComplete="name"
              />
            </Field>
            <Field label="Mobile number" error={fieldErrors.phone} hint="e.g. 03001234567">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                autoComplete="tel"
                placeholder="03001234567"
              />
            </Field>
            <Field label="Province" error={fieldErrors.province}>
              <select value={province} onChange={(e) => setProvince(e.target.value)} className="input">
                <option value="">Select province</option>
                {PAKISTAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Street address" error={fieldErrors.addressLine1} className="sm:col-span-2">
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="input"
                autoComplete="address-line1"
              />
            </Field>
            <Field label="Apartment, floor, etc. (optional)" className="sm:col-span-2">
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="input"
                autoComplete="address-line2"
              />
            </Field>
            <Field label="City" error={fieldErrors.city}>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" autoComplete="address-level2" />
            </Field>
            <Field label="Postal code" error={fieldErrors.postalCode}>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="input"
                autoComplete="postal-code"
              />
            </Field>
          </div>

          {delivery && (
            <div className="mt-4 rounded-lg border border-brand-success/30 bg-brand-success/5 p-3 font-body text-sm text-brand-success">
              Delivers to {city} in {delivery.days}. Delivery fee: {formatPKR(delivery.fee)}.
            </div>
          )}
        </section>

        <section>
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
            2. Promo code
          </h2>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter code"
              className="input max-w-xs"
            />
            <button
              type="button"
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="rounded-lg border border-brand-umber/30 px-4 py-2 font-body text-sm font-medium text-brand-umber-dark disabled:opacity-50"
            >
              {promoLoading ? "Checking…" : "Apply"}
            </button>
          </div>
          {promoStatus && (
            <p className={`mt-2 font-body text-sm ${promoStatus.valid ? "text-brand-success" : "text-brand-error"}`}>
              {promoStatus.message}
            </p>
          )}
        </section>

        <section>
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
            3. Verify your phone number
          </h2>
          <p className="mt-2 font-body text-sm text-brand-charcoal/70">
            We send a one-time code before every order confirms — it&apos;s how we keep Cash on Delivery orders real.
          </p>

          {!otpVerified ? (
            <div className="mt-4">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading || !phoneValid}
                  className="rounded-full bg-brand-umber px-6 py-2.5 font-body text-sm font-semibold text-brand-ivory disabled:opacity-50"
                >
                  {otpLoading ? "Sending…" : "Send verification code"}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="input max-w-[10rem]"
                  />
                  <button
                    type="button"
                    onClick={verifyOtpCode}
                    disabled={otpLoading || otpCode.length < 4}
                    className="rounded-full bg-brand-umber px-6 py-2.5 font-body text-sm font-semibold text-brand-ivory disabled:opacity-50"
                  >
                    {otpLoading ? "Verifying…" : "Verify"}
                  </button>
                  <button type="button" onClick={sendOtp} disabled={otpLoading} className="font-body text-xs text-brand-umber underline">
                    Resend code
                  </button>
                </div>
              )}
              {otpError && (
                <p role="alert" className="mt-2 font-body text-sm text-brand-error">
                  {otpError}
                </p>
              )}
              {devCode && (
                <p className="mt-2 font-body text-xs text-brand-charcoal/50">
                  Dev mode — verification code: {devCode} (SMS gateway not yet wired up)
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 font-body text-sm font-medium text-brand-success">Phone number verified ✓</p>
          )}
        </section>

        <section>
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
            4. Payment
          </h2>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3 rounded-lg border border-brand-umber bg-brand-sky/40 p-3 font-body text-sm">
              <input type="radio" name="payment" checked readOnly />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-brand-umber/15 p-3 font-body text-sm text-brand-charcoal/40">
              <input type="radio" name="payment" disabled />
              Card / JazzCash / Easypaisa — coming soon
            </label>
          </div>
        </section>
      </div>

      <div className="h-fit rounded-xl border border-brand-umber/10 p-6">
        <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Order summary</h2>
        <ul className="mt-4 space-y-2 font-body text-sm text-brand-charcoal/80">
          {lines.map((l) => (
            <li key={`${l.product_id}-${l.ring_size ?? ""}`} className="flex justify-between gap-2">
              <span>
                {l.name} × {l.quantity}
                {l.ring_size ? ` (US ${l.ring_size})` : ""}
              </span>
              <span>{formatPKR(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-brand-umber/10 pt-4 font-body text-sm">
          <div className="flex justify-between">
            <span className="text-brand-charcoal/70">Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand-success">
              <span>Discount</span>
              <span>−{formatPKR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-brand-charcoal/70">Delivery</span>
            <span>{delivery ? formatPKR(delivery.fee) : "Calculated below"}</span>
          </div>
          <div className="flex justify-between border-t border-brand-umber/10 pt-2 font-semibold text-brand-charcoal">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>
        </div>

        {orderError && (
          <p role="alert" className="mt-4 font-body text-sm text-brand-error">
            {orderError}
          </p>
        )}

        <button
          type="button"
          onClick={placeOrder}
          disabled={placing || lines.length === 0}
          className="mt-5 flex w-full items-center justify-center rounded-full bg-brand-umber py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? "Placing order…" : "Place order — Cash on Delivery"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block font-body text-sm font-medium text-brand-charcoal">
        <span className="mb-1.5 block">{label}</span>
        {children}
      </label>
      {hint && !error && <p className="mt-1 font-body text-xs text-brand-charcoal/50">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 font-body text-xs text-brand-error">
          {error}
        </p>
      )}
    </div>
  );
}
