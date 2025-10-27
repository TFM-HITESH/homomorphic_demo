"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paillierDecrypt, PrivateKey, PublicKey } from "@/lib/paillier"; // Import PublicKey

// Reusing parsePublicKey from createRiskAnalysisTask.ts
function parsePublicKey(key: string): PublicKey {
  const match = key.match(/\((\d+), (\d+)\)/);
  if (!match) {
    throw new Error("Invalid public key format");
  }
  return {
    n: BigInt(match[1]),
    g: BigInt(match[2]),
  };
}

// Modified parsePrivateKey
function parsePrivateKey(key: string): PrivateKey {
  const match = key.match(/\((\d+), (\d+)\)/); // Expects 2 numbers: lam, mu
  if (!match) {
    throw new Error("Invalid private key format");
  }
  return {
    lam: BigInt(match[1]),
    mu: BigInt(match[2]),
  };
}

export async function decryptRiskScore(taskId: string) {
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
    return { error: "Not authenticated", decryptedScore: null };
  }

  // Fetch the task details
  const { data: task, error: fetchError } = await supabaseAdmin
    .from("risk_analysis_tasks")
    .select("encrypted_risk_score, public_key") // Need public_key for decryption
    .eq("id", taskId)
    .eq("receiver_email", user.email) // Ensure the user is the receiver
    .single();

  if (fetchError || !task) {
    return { error: fetchError?.message || "Task not found" };
  }

  if (!task.encrypted_risk_score) {
    return { error: "Encrypted risk score not found for this task" };
  }

  // Get user's private key
  const { data: userData, error: userError } = await supabaseAdmin
    .from("user_data")
    .select("private_key")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.private_key) {
    return {
      error:
        "Could not find private key for user. Please generate keys in settings.",
    };
  }

  try {
    const privateKey = parsePrivateKey(userData.private_key);
    const publicKey = parsePublicKey(task.public_key); // Parse public key from task
    const encryptedScoreBigInt = BigInt(task.encrypted_risk_score);
    const decryptedValue = paillierDecrypt(
      publicKey,
      privateKey,
      encryptedScoreBigInt
    ); // Pass publicKey

    const featureScale = 100; // Consistent with encryption scale for features
    const weightScale = 1000; // Consistent with encryption scale for weights
    const combinedScale = featureScale * weightScale; // 100 * 1000 = 100,000

    const decryptedScore = Number(decryptedValue) / combinedScale;

    // Update the task in the database with the decrypted risk_score
    const { error: updateError } = await supabaseAdmin
      .from("risk_analysis_tasks")
      .update({ risk_score: decryptedScore })
      .eq("id", taskId);

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true, decryptedScore };
    // eslint-disable-next-line
  } catch (e: any) {
    console.error("Decryption error:", e);
    return { error: `Decryption failed: ${e.message}`, decryptedScore: null };
  }
}
