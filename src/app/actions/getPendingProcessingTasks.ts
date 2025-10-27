"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getPendingProcessingTasks() {
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

  // This page should not be user-specific, so we don't need to check user authentication
  // However, for security, we might want to ensure only authorized roles can access this.
  // For now, we'll fetch all tasks where encrypted_risk_score is null.

  const { data: tasks, error } = await supabaseAdmin
    .from("risk_analysis_tasks")
    .select("*")
    .is("encrypted_risk_score", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending processing tasks:", error);
    return { error: error.message, tasks: [] };
  }

  return { tasks };
}
