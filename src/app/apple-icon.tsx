import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          borderRadius: 36,
          gap: 7,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 38% 38%, #111827 0%, #111827 18%, transparent 18%), " +
                "radial-gradient(circle at 72% 28%, #111827 0%, #111827 14%, transparent 14%), " +
                "radial-gradient(circle at 28% 70%, #111827 0%, #111827 14%, transparent 14%), " +
                "radial-gradient(circle at 68% 68%, #111827 0%, #111827 14%, transparent 14%)",
            }}
          />
        </div>
        <div
          style={{
            color: "#fbbf24",
            fontSize: 28,
            fontWeight: 900,
            fontFamily: "sans-serif",
            letterSpacing: "0.06em",
            lineHeight: 1,
          }}
        >
          2026
        </div>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
