"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createRiskAnalysisTask } from "@/app/actions/createRiskAnalysisTask";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import toast from sonner

const featuresWithWeights = [
  { name: "age", label: "Age", weight: 0.2 },
  { name: "bmi", label: "BMI", weight: 0.3 },
  { name: "systolic_bp", label: "Systolic Blood Pressure", weight: 0.2 },
  { name: "diastolic_bp", label: "Diastolic Blood Pressure", weight: 0.2 },
  { name: "cholesterol", label: "Cholesterol", weight: 0.1 },
];

export function NewRiskAnalysisForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      receiver_email: "",
      age: 0,
      bmi: 0,
      systolic_bp: 0,
      diastolic_bp: 0,
      cholesterol: 0,
    },
  });

  // eslint-disable-next-line
  async function onSubmit(values: any) {
    setIsSubmitting(true);
    const result = await createRiskAnalysisTask(values);
    setIsSubmitting(false);

    if (result.error) {
      toast.error("Error creating task", {
        description: result.error,
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
        duration: Infinity,
      });
    } else if (result.success) {
      toast.success("Task created successfully!", {
        description: "Your risk analysis task has been initiated.",
        action: {
          label: "OK",
          onClick: () => {},
        },
        duration: Infinity,
      });
      router.refresh();
      // Maybe close the dialog here
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="receiver_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="analyst@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="text-lg font-medium">Medical Features</h3>
          <div className="space-y-4 mt-4">
            {featuresWithWeights.map((feature) => (
              <FormField
                control={form.control}
                key={feature.name}
                // eslint-disable-next-line
                name={feature.name as any}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{feature.label}</FormLabel>
                      <span className="text-sm text-muted-foreground">
                        Weight: {feature.weight}
                      </span>
                    </div>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </Form>
  );
}
