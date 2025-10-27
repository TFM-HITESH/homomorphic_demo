"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getOutgoingTaskById(id: string) {
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

      const { data: { user }, } = await supabase.auth.getUser();

    

      if (!user) {

        return { error: "Not authenticated", task: null };

      }

    

      const { data: task, error } = await supabase

        .from("risk_analysis_tasks")

        .select("*")

        .eq("id", id)

        .eq("user_id", user.id)

        .single(); // Use .single() to get a single record

    

      if (error) {

        return { error: error.message, task: null };

      }

    

      return { task };
}
