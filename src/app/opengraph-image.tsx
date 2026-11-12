import { ImageResponse } from "next/og";
import { OG_SIZE, brandCard } from "@/lib/ogCards";

// The Edge runtime avoids the Node-only @vercel/og loader on Windows.
export const runtime = "edge";

export const alt = "Dev Passport: a developer portfolio that comes with proof";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(brandCard(), { ...size });
}
