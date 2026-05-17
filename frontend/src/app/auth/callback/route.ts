import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'
import {cookies} from 'next/headers'
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const cookieStore = await cookies();
  if (code) {
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/agents/fitness`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
