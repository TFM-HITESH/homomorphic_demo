"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paillierKeygen } from "@/lib/paillier";

export async function regenerateKeys() {
  const cookieStore = cookies();
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
          cookieStore.delete(name, options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { pub, priv } = paillierKeygen();

  const publicKey = `(${pub.n.toString()}, ${pub.g.toString()})`;
  const privateKey = `(${priv.lam.toString()}, ${priv.mu.toString()})`;

  const { error } = await supabaseAdmin.from("user_data").upsert({
    id: user.id,
    email: user.email,
    public_key: publicKey,
    private_key: privateKey,
  });

  if (error) {
    console.error("Error updating keys:", error);
    return { error: error.message };
  }

  return { success: true, publicKey, privateKey };
}
