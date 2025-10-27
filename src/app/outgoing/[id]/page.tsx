import { getOutgoingTaskById } from "@/app/actions/getOutgoingTaskById";
// Removed TaskCard import as we are building custom UI
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

export default async function TaskDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { task, error } = await getOutgoingTaskById(id);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  // Map the fetched task data to a more display-friendly format
  // We'll keep the structure similar to the Task type for consistency,
  // but it's not strictly necessary since we're not using TaskCard directly.
  const displayTask = {
    id: task.id,
    type: "Risk Scoring", // Assuming a default type
    sender: task.sender_email,
    receiver: task.receiver_email,
    publicKey: task.public_key,
    data: `Age: ${task.age}, BMI: ${task.bmi}, Systolic BP: ${task.systolic_bp}, Diastolic BP: ${task.diastolic_bp}, Cholesterol: ${task.cholesterol}`,
    encryptedData: task.encrypted_features,
    createdAt: new Date(task.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), // Format date to IST
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Task Details</h1>

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
                <Label htmlFor="taskId" className="text-muted-foreground mb-2">
                  Task ID
                </Label>
                <Input
                  id="taskId"
                  value={displayTask.id}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="createdAt"
                  className="text-muted-foreground mb-2"
                >
                  Created At
                </Label>
                <Input
                  id="createdAt"
                  value={displayTask.createdAt}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid gap-2">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Key Details
            </h2>
            <div>
              <Label htmlFor="publicKey" className="text-muted-foreground mb-2">
                Public Key
              </Label>
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
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Data</h2>
            <div>
              <Label htmlFor="data" className="text-muted-foreground mb-2">
                Input Data
              </Label>
              <Input
                id="data"
                value={displayTask.data}
                readOnly
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Encrypted Data */}
          {displayTask.encryptedData && (
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                Encrypted Features
              </h2>
              <div>
                <Label
                  htmlFor="encryptedFeatures"
                  className="text-muted-foreground mb-2"
                >
                  Encrypted Features (JSON)
                </Label>
                <Textarea
                  id="encryptedFeatures"
                  value={
                    JSON.stringify(displayTask.encryptedData, null, 2) || "N/A"
                  }
                  readOnly
                  rows={10}
                  className="font-mono text-sm break-all"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
