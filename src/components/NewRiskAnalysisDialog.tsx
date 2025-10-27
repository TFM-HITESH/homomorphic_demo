"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewRiskAnalysisForm } from "./NewRiskAnalysisForm";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export function NewRiskAnalysisDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          New Risk Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Risk Analysis Task</DialogTitle>
          <DialogDescription>
            Enter the features and weights to create a new risk analysis task.
          </DialogDescription>
        </DialogHeader>
        <NewRiskAnalysisForm />
      </DialogContent>
    </Dialog>
  );
}
