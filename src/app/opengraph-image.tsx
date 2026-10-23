import { ImageResponse } from "next/og";
import { BRAND_NAME, TAGLINE } from "@/lib/brand";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Solid brand-blue card rather than a cropped product photo: chat apps
// (WhatsApp, iMessage) show only the center square of this 1200x630 canvas
// in their compact link-preview thumbnail, so a solid background reads
// identically from any crop instead of risking the wordmark landing outside
// the visible window.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#63A8C0",
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 700,
            color: "#FAE3B1",
            fontFamily: "Georgia, serif",
            letterSpacing: 4,
            lineHeight: 1,
          }}
        >
          {BRAND_NAME}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#FDF2DC",
            textAlign: "center",
            maxWidth: 840,
          }}
        >
          {TAGLINE}
        </div>
      </div>
    ),
    { ...size }
  );
}
