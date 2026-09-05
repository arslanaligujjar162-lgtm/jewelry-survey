import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { TAGLINE } from "@/lib/brand";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo-primary.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

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
          background: "#FBF7EE",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unusable inside next/og's ImageResponse renderer */}
        <img
          src={logoSrc}
          width={200}
          height={200}
          style={{ borderRadius: 40 }}
          alt=""
        />
        <div style={{ marginTop: 32, fontSize: 48, fontWeight: 600, color: "#482A24", fontFamily: "Georgia, serif" }}>
          1720
        </div>
        <div style={{ marginTop: 12, fontSize: 26, color: "#673C34" }}>{TAGLINE}</div>
      </div>
    ),
    { ...size }
  );
}
