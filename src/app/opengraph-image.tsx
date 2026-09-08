import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { BRAND_NAME, TAGLINE } from "@/lib/brand";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function toDataUri(relativePath: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

export default function OpengraphImage() {
  const productSrc = toDataUri("products/confetti-hoop-1.jpg", "image/jpeg");
  const logoSrc = toDataUri("brand/logo-light.png", "image/png");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#231F1C",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unusable inside next/og's ImageResponse renderer */}
        <img
          src={productSrc}
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          alt=""
        />
        {/* Bottom scrim for text legibility over the photo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 220,
            display: "flex",
            background: "linear-gradient(to top, rgba(35,31,28,0.88), rgba(35,31,28,0))",
          }}
        />
        {/* Small logo badge, corner accent -- not the dominant element */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={72}
          height={72}
          style={{ position: "absolute", left: 40, bottom: 40, borderRadius: 16 }}
          alt=""
        />
        <div
          style={{
            position: "absolute",
            left: 132,
            bottom: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: 72,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, color: "#FAE3B1", fontFamily: "Georgia, serif" }}>
            {BRAND_NAME}
          </div>
          <div style={{ marginTop: 4, fontSize: 22, color: "#FBF7EE" }}>{TAGLINE}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
