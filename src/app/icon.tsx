import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: "#8FC6DE",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: "#5C3A21", fontFamily: "Georgia, serif" }}>1720</div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: "#F3E3A6" }} />
          <div style={{ width: 4, height: 4, borderRadius: 2, background: "#F3E3A6" }} />
          <div style={{ width: 4, height: 4, borderRadius: 2, background: "#F3E3A6" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
