import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
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
    ),
    { ...size }
  );
}
