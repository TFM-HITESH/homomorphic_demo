"use client";

import { useState, useEffect } from "react";
import { getIncomingTasks } from "@/app/actions/getIncomingTasks";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncomingTaskCardProps, IncomingTaskCard } from "@/components/IncomingTaskCard"; // Import IncomingTaskCard

// Define a type for the task data that matches the database schema
interface IncomingTask {
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

const ITEMS_PER_PAGE = 6; // Assuming similar pagination as OutgoingTasks

export default function IncomingPage() {
  const [tasks, setTasks] = useState<IncomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      const { tasks: fetchedTasks, error: fetchError } = await getIncomingTasks();
      if (fetchError) {
        setError(fetchError);
      } else {
        setTasks(fetchedTasks as IncomingTask[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, endIndex);

  const mappedTasks: IncomingTaskCardProps[] = currentTasks.map((task) => ({
    id: task.id,
    type: "Risk Scoring", // Assuming a default type
    sender: task.sender_email,
    receiver: task.receiver_email,
    publicKey: task.public_key,
    data: `Age: ${task.age}, BMI: ${task.bmi}, Systolic BP: ${task.systolic_bp}, Diastolic BP: ${task.diastolic_bp}, Cholesterol: ${task.cholesterol}`,
    isProcessed: task.encrypted_risk_score !== null,
    isDecrypted: task.risk_score !== null,
  }));

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading incoming tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Incoming Tasks</h1>
      {tasks.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No incoming tasks found.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tasks received</CardTitle>
            <CardDescription>
              View tasks sent to you for processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mappedTasks.map((task) => (
                <IncomingTaskCard key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
          {tasks.length > 0 && (
            <CardFooter className="flex justify-center items-center">
              <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="mx-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
