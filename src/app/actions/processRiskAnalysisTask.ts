"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { eMulConst, eAdd, PublicKey } from "@/lib/paillier";

const featuresWithWeights = [
  { name: "age", label: "Age", weight: 0.2 },
  { name: "bmi", label: "BMI", weight: 0.3 },
  { name: "systolic_bp", label: "Systolic Blood Pressure", weight: 0.2 },
  { name: "diastolic_bp", label: "Diastolic Blood Pressure", weight: 0.2 },
  { name: "cholesterol", label: "Cholesterol", weight: 0.1 },
];

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

export async function processRiskAnalysisTask(taskId: string) {
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

  // Fetch the task details
  const { data: task, error: fetchError } = await supabaseAdmin
    .from("risk_analysis_tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) {
    return { error: fetchError?.message || "Task not found" };
  }

  if (!task.public_key || !task.encrypted_features) {
    return { error: "Task is missing public key or encrypted features" };
  }

  const publicKey = parsePublicKey(task.public_key);
  const wscale = 1000; // Use a scale for weights, consistent with createRiskAnalysisTask

  // Homomorphically calculate risk score
  let encryptedRiskScore: bigint | null = null;
  for (let i = 0; i < featuresWithWeights.length; i++) {
    const feature = featuresWithWeights[i];
    const encryptedFeature = BigInt(task.encrypted_features[feature.name]);
    const weight = Math.round(feature.weight * wscale);

    const weightedEncryptedFeature = eMulConst(
      publicKey,
      encryptedFeature,
      weight
    );

    if (encryptedRiskScore === null) {
      encryptedRiskScore = weightedEncryptedFeature;
    } else {
      encryptedRiskScore = eAdd(
        publicKey,
        encryptedRiskScore,
        weightedEncryptedFeature
      );
    }
  }

  if (encryptedRiskScore === null) {
    return { error: "Could not calculate risk score" };
  }

  // Update the task in the database with the calculated encrypted_risk_score
  const { error: updateError } = await supabaseAdmin
    .from("risk_analysis_tasks")
    .update({ encrypted_risk_score: encryptedRiskScore.toString() })
    .eq("id", taskId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}
