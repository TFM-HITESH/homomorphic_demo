"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paillierEncrypt, PublicKey } from "@/lib/paillier";

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
// eslint-disable-next-line
export async function createRiskAnalysisTask(formData: { [key: string]: any }) {
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
    return { error: "Not authenticated" };
  }

  // 1. Get receiver's public key
  const { data: receiverData, error: receiverError } = await supabaseAdmin
    .from("user_data")
    .select("public_key")
    .eq("email", formData.receiver_email)
    .single();

  if (receiverError || !receiverData?.public_key) {
    return {
      error:
        "Could not find public key for receiver. Ensure the receiver has generated keys.",
    };
  }

  const publicKey = parsePublicKey(receiverData.public_key);
  const scale = 100; // Use a scale to handle floating point features
  //   const wscale = 1000; // Use a scale for weights

  // 2. Encrypt features
  const encryptedFeatures: { [key: string]: string } = {};
  const featureValues: number[] = [];
  for (const feature of featuresWithWeights) {
    const value = parseFloat(formData[feature.name]);
    if (isNaN(value)) {
      return { error: `Invalid value for ${feature.label}` };
    }
    featureValues.push(value);
    const encoded = Math.round(value * scale);
    const encrypted = paillierEncrypt(publicKey, encoded);
    encryptedFeatures[feature.name] = encrypted.toString();
  }

  // 3. Insert into DB
  const { error: insertError } = await supabaseAdmin
    .from("risk_analysis_tasks")
    .insert({
      user_id: user.id,
      sender_email: user.email,
      receiver_email: formData.receiver_email,
      age: formData.age,
      bmi: formData.bmi,
      systolic_bp: formData.systolic_bp,
      diastolic_bp: formData.diastolic_bp,
      cholesterol: formData.cholesterol,
      risk_score: null, // The server doesn't know the score yet
      encrypted_features: encryptedFeatures,
      public_key: receiverData.public_key,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  return { success: true };
}
