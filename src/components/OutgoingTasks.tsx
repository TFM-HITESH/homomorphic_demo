"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Task, TaskCard } from "@/components/TaskCard";
import { NewRiskAnalysisDialog } from "@/components/NewRiskAnalysisDialog";

const ITEMS_PER_PAGE = 6;

// eslint-disable-next-line
export function OutgoingTasks({ tasks }: { tasks: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, endIndex);

  const mappedTasks = currentTasks.map((task) => ({
    id: task.id,
    type: "Risk Scoring",
    sender: task.sender_email,
    receiver: task.receiver_email,
    publicKey: task.public_key,
    data: `Age: ${task.age}, BMI: ${task.bmi}, Systolic BP: ${task.systolic_bp}, Diastolic BP: ${task.diastolic_bp}, Cholesterol: ${task.cholesterol}`,
    isProcessed: task.encrypted_risk_score !== null,
    isDecrypted: task.risk_score !== null,
  }));

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-2">
            <CardTitle>Risk Analysis Tasks</CardTitle>
            <CardDescription>
              Create and manage risk analysis tasks
            </CardDescription>
          </div>
          <NewRiskAnalysisDialog />
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No Tasks, create new task!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mappedTasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
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
    </div>
  );
}
