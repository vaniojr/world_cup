import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeStr } = await params;
  const size = parseInt(sizeStr, 10) || 512;
  const radius = Math.round(size * 0.2);
  const ballSize = Math.round(size * 0.44);
  const fontSize = Math.round(size * 0.155);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          borderRadius: radius,
          gap: Math.round(size * 0.04),
        }}
      >
        {/* Soccer ball (geometric) */}
        <div
          style={{
            width: ballSize,
            height: ballSize,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Hexagon pattern overlay */}
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

        {/* "2026" label */}
        <div
          style={{
            color: "#fbbf24",
            fontSize,
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
    { width: size, height: size },
  );
}
