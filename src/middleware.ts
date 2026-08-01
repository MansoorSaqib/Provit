import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Customer auth routes — redirect to account if already logged in
  if (user && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // Protected customer routes
  const customerProtected = ["/account", "/cart", "/checkout"];
  if (!user && customerProtected.some((p) => path.startsWith(p))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Admin/staff protected sub-routes — /admin itself is the public login page
  const adminProtected = [
    "/admin/dashboard",
    "/admin/orders",
    "/admin/products",
    "/admin/inventory",
    "/admin/customers",
    "/admin/staff",
  ];
  if (!user && adminProtected.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
