"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getIncomingTasks() {
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
    return { error: "Not authenticated or user email not found", tasks: [] };
  }

  const { data: tasks, error } = await supabase
    .from("risk_analysis_tasks")
    .select("*")
    .eq("receiver_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching incoming tasks:", error);
    return { error: error.message, tasks: [] };
  }

  return { tasks };
}
