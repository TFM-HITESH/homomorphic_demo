"use client";

import { useState } from "react";
import { decryptRiskScore } from "@/app/actions/decryptRiskScore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface IncomingTaskDetailsClientProps {
  task: {
    id: string;
    created_at: string;
    user_id: string;
    sender_email: string;
    receiver_email: string;
    age: number;
    bmi: number;
    systolic_bp: number;
    diastolic_bp: number;
    cholesterol: number;
    risk_score: number | null;
    encrypted_features: { [key: string]: string };
    encrypted_risk_score: string | null;
    public_key: string;
  };
}

export function IncomingTaskDetailsClient({ task }: IncomingTaskDetailsClientProps) {
  const [decryptedRiskScore, setDecryptedRiskScore] = useState<number | null>(
    task?.risk_score || null
  );
  const [isDecrypting, setIsDecrypting] = useState(false);

  const displayTask = {
    id: task.id,
    type: "Risk Scoring", // Assuming a default type
    sender: task.sender_email,
    receiver: task.receiver_email,
    publicKey: task.public_key,
    data: `Age: ${task.age}, BMI: ${task.bmi}, Systolic BP: ${task.systolic_bp}, Diastolic BP: ${task.diastolic_bp}, Cholesterol: ${task.cholesterol}`,
    encryptedFeatures: task.encrypted_features,
    encryptedRiskScore: task.encrypted_risk_score,
    riskScore: decryptedRiskScore, // Use state for riskScore
    createdAt: new Date(task.created_at).toLocaleString(), // Format date
  };

  const handleDecryptRiskScore = async () => {
    setIsDecrypting(true);
    const { success, decryptedScore, error: decryptError } = await decryptRiskScore(task.id);
    setIsDecrypting(false);

    if (decryptError) {
      toast.error("Decryption Failed", {
        description: decryptError,
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
        duration: Infinity,
      });
    } else if (success && decryptedScore !== null) {
      setDecryptedRiskScore(decryptedScore);
      toast.success("Risk Score Decrypted", {
        description: `Decrypted Risk Score: ${decryptedScore}`, 
        action: {
          label: "OK",
          onClick: () => {},
        },
        duration: Infinity,
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Incoming Task Details</h1>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{displayTask.type}</CardTitle>
          <CardDescription>
            From: {displayTask.sender} To: {displayTask.receiver}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Task Information */}
          <div className="grid gap-2">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Task Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskId" className="text-muted-foreground mb-2">Task ID</Label>
                <Input id="taskId" value={displayTask.id} readOnly className="font-mono text-sm" />
              </div>
              <div>
                <Label htmlFor="createdAt" className="text-muted-foreground mb-2">Created At</Label>
                <Input id="createdAt" value={displayTask.createdAt} readOnly className="font-mono text-sm" />
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid gap-2">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Key Details
            </h2>
            <div>
              <Label htmlFor="publicKey" className="text-muted-foreground mb-2">Public Key</Label>
              <Textarea
                id="publicKey"
                value={displayTask.publicKey || "N/A"}
                readOnly
                rows={5}
                className="font-mono text-sm break-all"
              />
            </div>
          </div>

          {/* Data */}
          <div className="grid gap-2">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Input Data
            </h2>
            <div>
              <Label htmlFor="data" className="text-muted-foreground mb-2">Original Input Data</Label>
              <Input id="data" value={displayTask.data} readOnly className="font-mono text-sm" />
            </div>
          </div>

          {/* Encrypted Features */}
          {displayTask.encryptedFeatures && (
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                Encrypted Features
              </h2>
              <div>
                <Label htmlFor="encryptedFeatures" className="text-muted-foreground mb-2">Encrypted Features (JSON)</Label>
                <Textarea
                  id="encryptedFeatures"
                  value={JSON.stringify(displayTask.encryptedFeatures, null, 2) || "N/A"}
                  readOnly
                  rows={10}
                  className="font-mono text-sm break-all"
                />
              </div>
            </div>
          )}

          {/* Encrypted Risk Score */}
          {displayTask.encryptedRiskScore && (
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                Encrypted Risk Score
              </h2>
              <div>
                <Label htmlFor="encryptedRiskScore" className="text-muted-foreground mb-2">Encrypted Risk Score</Label>
                <Textarea
                  id="encryptedRiskScore"
                  value={displayTask.encryptedRiskScore || "N/A"}
                  readOnly
                  rows={5}
                  className="font-mono text-sm break-all"
                />
              </div>
            </div>
          )}

          {/* Decrypted Risk Score */}
          {displayTask.riskScore !== null && (
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                Decrypted Risk Score
              </h2>
              <div>
                <Label htmlFor="riskScore" className="text-muted-foreground mb-2">Risk Score</Label>
                <Input id="riskScore" value={displayTask.riskScore} readOnly className="font-mono text-sm" />
              </div>
            </div>
          )}

          {/* Decrypt Button */}
          {displayTask.encryptedRiskScore && displayTask.riskScore === null && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleDecryptRiskScore} disabled={isDecrypting}>
                {isDecrypting ? "Decrypting..." : "Decrypt Risk Score"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
