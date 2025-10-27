"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getIncomingTaskById(id: string) {
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

  if (!user || !user.email) {
    return { error: "Not authenticated or user email not found", task: null };
  }

  const { data: task, error } = await supabase
    .from("risk_analysis_tasks")
    .select("*")
    .eq("id", id)
    .eq("receiver_email", user.email) // Filter by receiver_email
    .single();

  if (error) {
    console.error("Error fetching incoming task:", error);
    return { error: error.message, task: null };
  }

  return { task };
}
