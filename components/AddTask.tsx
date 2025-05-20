"use client";

import { useForm } from "react-hook-form";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "@/components/ui/form";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react"; // Or any calendar icon you use
import { format } from "date-fns";

type AddTaskForm = {
  title: string;
  description: string;
  dueDate: Date | null;
  dueTime: string;
};

type AddTaskProps = {
  onTaskAdded?: () => void;
};

export default function AddTask({ onTaskAdded }: AddTaskProps) {
  const form = useForm<AddTaskForm>({
    defaultValues: {
      title: "",
      description: "",
      dueDate: null,
      dueTime: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: AddTaskForm) {
    setLoading(true);
    const dueDateStr = values.dueDate
      ? `${values.dueDate.getMonth() + 1}-${values.dueDate.getDate()}-${values.dueDate.getFullYear()}`
      : "";
    await addDoc(collection(db, "tasks"), {
      title: values.title,
      description: values.description,
      dueDate: dueDateStr,
      dueTime: values.dueTime,
      reminder: false,
      completed: false,
      dateAdded: new Date().toLocaleDateString("en-US"),
      priority: 0,
    });
    form.reset();
    setLoading(false);
    if (onTaskAdded) onTaskAdded();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Task</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="title"
              control={form.control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "MM-dd-yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="dueTime"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}