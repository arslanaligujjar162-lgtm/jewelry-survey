import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The brand's own logo artwork (the same image used on Instagram), so every
// shared link looks identical across channels. The mark sits in the middle of
// the square, so cropping it to this wide canvas keeps it fully visible.
export default function OpengraphImage() {
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-primary.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#63A8C0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unusable inside next/og's ImageResponse renderer */}
        <img
          src={logoSrc}
          width={1200}
          height={630}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
