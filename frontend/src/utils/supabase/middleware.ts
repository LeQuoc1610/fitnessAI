import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient(request: NextRequest) {
  const res = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  return { supabase, res };
}

export const updateSession = async (request: NextRequest) => {
  const { supabase, res } = createClient(request);
  try {

    await supabase.auth.getUser();
  } catch (e) {
    
    console.error('[supabase middleware] getUser error', e);
  }
  return res;
};
