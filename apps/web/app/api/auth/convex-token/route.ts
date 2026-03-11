import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";

export async function GET() {
  await auth0.getAccessToken();
  const session = await auth0.getSession();
  const token = session?.tokenSet.idToken;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
