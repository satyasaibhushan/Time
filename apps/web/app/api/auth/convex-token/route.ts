import { auth0 } from "@/lib/auth0";
import { createConvexTokenResponse } from "@/lib/convex-token";

export async function GET() {
  return createConvexTokenResponse(auth0);
}
