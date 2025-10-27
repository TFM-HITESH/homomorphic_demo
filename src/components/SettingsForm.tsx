"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Copy } from "lucide-react";
import * as React from "react";
import { regenerateKeys } from "@/app/actions/regenerateKeys";

type UserData = {
  email: string | null;
  publicKey: string | null;
  privateKey: string | null;
  error?: string;
};

export function SettingsForm({
  userData: initialUserData,
}: {
  userData: UserData;
}) {
  const [userData, setUserData] = React.useState(initialUserData);
  const [showPrivateKey, setShowPrivateKey] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRegenerateKeys = async () => {
    setIsSubmitting(true);
    const result = await regenerateKeys();
    if (result.error) {
      // You might want to show a toast notification here
      alert(`Error: ${result.error}`);
    } else if (result.success) {
      setUserData({
        ...userData,
        publicKey: result.publicKey,
        privateKey: result.privateKey,
      });
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here to show feedback
  };

  if (userData.error && userData.error !== "Not authenticated") {
    // Handle case where user is in auth but not user_data table yet
    if (userData.publicKey === null) {
      // This is not an error, we will generate keys for them.
    } else {
      return <p>Error: {userData.error}</p>;
    }
  }

  if (!userData.email) {
    return <p>Access Denied</p>;
  }

  const email = userData.email;
  const publicKey =
    userData.publicKey ?? "No public key found. Please generate one.";
  const privateKey =
    userData.privateKey ?? "No private key found. Please generate one.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
        <CardDescription>
          Manage your account and encryption key settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="public-key">Public Key</Label>
          <div className="flex items-center gap-2">
            <Input id="public-key" value={publicKey} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(publicKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="private-key">Private Key</Label>
          <div className="flex items-center gap-2">
            <Input
              id="private-key"
              type={showPrivateKey ? "text" : "password"}
              value={privateKey}
              readOnly
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(privateKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRegenerateKeys} disabled={isSubmitting}>
          {isSubmitting ? "Regenerating..." : "Regenerate Keys"}
        </Button>
      </CardFooter>
    </Card>
  );
}
