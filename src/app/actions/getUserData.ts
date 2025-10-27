import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getUserData(): Promise<{
  email: string | null;
  publicKey: string | null;
  privateKey: string | null;
  error?: string;
}> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name: string) => {
            const cookie = await cookieStore.get(name);
            return cookie?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated', email: null, publicKey: null, privateKey: null };
  }

  const email = user.email ?? null;

  const { data, error } = await supabaseAdmin
    .from('user_data')
    .select('public_key, private_key')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return { email, publicKey: null, privateKey: null, error: error.message };
  }

  return {
    email,
    publicKey: data.public_key,
    privateKey: data.private_key,
  };
}
