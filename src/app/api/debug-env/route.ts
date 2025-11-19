import { NextResponse } from "next/server";

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL || "NOT SET";
  const nodeEnv = process.env.NODE_ENV || "NOT SET";

  return NextResponse.json({
    "NEXTAUTH_URL_IS": nextAuthUrl,
    "NODE_ENV_IS": nodeEnv,
    "MESSAGE": "This is the value of the environment variable as seen by the running Next.js application.",
  });
}
