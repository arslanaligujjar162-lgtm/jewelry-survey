import { ImageResponse } from "next/og";
import { TAGLINE } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#FBF7EE",
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 40,
            background: "#8FC6DE",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, color: "#5C3A21", fontFamily: "Georgia, serif" }}>1720</div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#F3E3A6" }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#F3E3A6" }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#F3E3A6" }} />
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 48, fontWeight: 600, color: "#3E2716", fontFamily: "Georgia, serif" }}>
          7teen2wenty
        </div>
        <div style={{ marginTop: 12, fontSize: 26, color: "#5C3A21" }}>{TAGLINE}</div>
      </div>
    ),
    { ...size }
  );
}
