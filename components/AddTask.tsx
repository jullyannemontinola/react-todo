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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

type AddTaskForm = {
  title: string;
  description: string;
  dueDate: Date | null;
  dueTime: string;
  priority: string;
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
      priority: "none",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: AddTaskForm) {
    setLoading(true);
    const dueDateStr = values.dueDate
      ? format(values.dueDate, "MMMM d, yyyy")
      : "";
    await addDoc(collection(db, "tasks"), {
      title: values.title,
      description: values.description,
      dueDate: dueDateStr,
      dueTime: values.dueTime,
      completed: false,
      dateAdded: format(new Date(), "MMMM d, yyyy"),
      priority: values.priority,
    });
    form.reset();
    setLoading(false);
    if (onTaskAdded) onTaskAdded();
  }

  return (
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
                    {field.value ? format(field.value, "MMMM d, yyyy") : "Pick a date"}
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
        <FormField
          name="priority"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex flex-col gap-2"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="none" id="priority-none" />
                    <label htmlFor="priority-none" className="flex items-center gap-1 cursor-pointer">
                      <Badge className="bg-gray-400 text-black">No Priority</Badge>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="low" id="priority-low" />
                    <label htmlFor="priority-low" className="flex items-center gap-1 cursor-pointer">
                      <Badge className="bg-yellow-400 text-black">Low</Badge>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="mid" id="priority-mid" />
                    <label htmlFor="priority-mid" className="flex items-center gap-1 cursor-pointer">
                      <Badge className="bg-orange-400 text-black">Mid</Badge>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="high" id="priority-high" />
                    <label htmlFor="priority-high" className="flex items-center gap-1 cursor-pointer">
                      <Badge className="bg-red-500 text-white">High</Badge>
                    </label>
                  </div>
                </RadioGroup>
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
  );
}