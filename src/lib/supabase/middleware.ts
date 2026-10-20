import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/signup');
  const isAppRoute = request.nextUrl.pathname.startsWith('/home') ||
                      request.nextUrl.pathname.startsWith('/chat') ||
                      request.nextUrl.pathname.startsWith('/daily') ||
                      request.nextUrl.pathname.startsWith('/memories') ||
                      request.nextUrl.pathname.startsWith('/us');
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding');

  if (!user && (isAppRoute || isOnboarding)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
