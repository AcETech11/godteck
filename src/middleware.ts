import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Match public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/p/(.*)",
  "/join",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Match admin routes
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const isPublic = isPublicRoute(req);
  const isAdmin = isAdminRoute(req);

  // 1. Admin route protection - ONLY runs when requesting an admin route
  if (isAdmin) {
    const session = await auth();

    // If not logged in, redirect to sign-in
    if (!session.userId) {
      return session.redirectToSignIn({ returnBackUrl: req.url });
    }

    // Check if role is admin in publicMetadata or metadata
    const publicMetadata = session.sessionClaims?.publicMetadata as { role?: string } | undefined;
    const metadata = (session.sessionClaims as any)?.metadata as { role?: string } | undefined;
    const role = publicMetadata?.role || metadata?.role;

    if (role !== "admin") {
      // Fallback check via Supabase profiles table
      try {
        const supabase = createAdminClient();
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.userId)
          .single();

        if (error || profile?.role !== "admin") {
          // Return 403 Forbidden
          return new NextResponse("Forbidden", { status: 403 });
        }
      } catch (err) {
        console.error("Error checking admin status in middleware:", err);
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  // 2. Private route protection (e.g. /dashboard/* or anything not public)
  if (!isPublic) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[\\w]+$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
