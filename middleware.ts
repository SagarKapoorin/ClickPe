import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasSupabaseSession = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"),
    );
  const hasLoginFlag =
    request.cookies.get("lp_logged_in")?.value === "1";
  if (!hasSupabaseSession && !hasLoginFlag) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/conversations/:path*",
  ],
};
