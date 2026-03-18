import { NextResponse } from "next/server";

export const dynamic = "force-static";

const iconMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#0F172A"/>
  <path d="M38 26C38 37 28 42 28 53C28 64 38 69 49 69C60 69 71 64 71 53" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round"/>
  <circle cx="74" cy="53" r="6" fill="#FDBA74"/>
  <path d="M31 78L44 91" stroke="#FDBA74" stroke-width="8" stroke-linecap="round"/>
  <path d="M49 95L56 88C59 85 64 87 67 90L69 92C72 95 74 97 71 100L64 107" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round"/>
</svg>
`.trim();

export function GET() {
  return new NextResponse(iconMarkup, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
