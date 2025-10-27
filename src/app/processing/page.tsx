"use client";

import { useState, useEffect } from "react";
import { getPendingProcessingTasks } from "@/app/actions/getPendingProcessingTasks";
import { processRiskAnalysisTask } from "@/app/actions/processRiskAnalysisTask"; // Import the new action
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define a type for the task data that matches the database schema
interface ProcessingTask {
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
}

// ProcessingTaskCard component
function ProcessingTaskCard({
  task,
  onTaskProcessed,
}: {
  task: ProcessingTask;
  onTaskProcessed: (taskId: string) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessTask = async () => {
    setIsProcessing(true);
    const { success, error } = await processRiskAnalysisTask(task.id);
    setIsProcessing(false);

    if (error) {
      toast.error(error, {
        description: "Please try again.",
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
        duration: Infinity,
      });
    } else if (success) {
      toast.success(`Task ${task.id} Processed`, {
        description: "The encrypted risk score has been calculated.",
        action: {
          label: "OK",
          onClick: () => {},
        },
        duration: Infinity,
      });
      onTaskProcessed(task.id); // Notify parent to remove the task
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Risk Analysis Task</CardTitle>
        <CardDescription>ID: {task.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>From: {task.sender_email}</p>
        <p>To: {task.receiver_email}</p>
        <Button
          onClick={handleProcessTask}
          className="mt-4"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Task"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProcessingPage() {
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTaskProcessed = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      const { tasks: fetchedTasks, error: fetchError } =
        await getPendingProcessingTasks();
      if (fetchError) {
        setError(fetchError);
      } else {
        setTasks(fetchedTasks as ProcessingTask[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Processing</h1>
        <p>
          This is the page where users can perform operations on encrypted data.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Pending Processing Tasks
      </h1>
      {tasks.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No tasks awaiting processing.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <ProcessingTaskCard
              key={task.id}
              task={task}
              onTaskProcessed={handleTaskProcessed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
