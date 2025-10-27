"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cpu, Key } from "lucide-react"; // Import Key
import Link from "next/link";

export type IncomingTaskCardProps = {
  id: string;
  type: string;
  sender: string;
  receiver: string;
  publicKey: string;
  data: string;
  isProcessed?: boolean;
  isDecrypted?: boolean;
};

// Removed taskTypeColorMap

export function IncomingTaskCard({ task }: { task: IncomingTaskCardProps }) {
  // Removed cardColorClass

  const displayPublicKey = task.publicKey
    ? `${task.publicKey.slice(0, 20)}...`
    : "N/A";

  return (
    <Link href={`/incoming/${task.id}`}>
      <Card className="hover:shadow-lg transition-shadow border"> {/* Applied default shadcn card styling */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{task.type}</CardTitle>
            <div className="flex items-center">
              {task.isProcessed && (
                <span
                  className="text-green-500 text-lg ml-2"
                  title="Processing Complete"
                >
                  <Cpu className="h-5 w-5 " />
                </span>
              )}
              {task.isDecrypted && (
                <span
                  className="text-blue-500 text-lg ml-2"
                  title="Decryption Complete"
                >
                  <Key className="h-5 w-5 " />
                </span>
              )}
            </div>
          </div>
          <CardDescription>
            From: {task.sender} To: {task.receiver}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <strong>Public Key:</strong>{" "}
            <span className="font-mono text-sm">{displayPublicKey}</span>
          </div>
          <div>
            <strong>Data:</strong>{" "}
            <span className="font-mono text-sm">{task.data}</span>
          </div>
          {/* Encrypted Data (encrypted_risk_score) is not shown on the list view */}
        </CardContent>
      </Card>
    </Link>
  );
}
