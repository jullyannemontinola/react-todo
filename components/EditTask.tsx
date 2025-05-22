"use client";

import { useForm } from "react-hook-form";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

type EditTaskForm = {
  title: string;
  description: string;
  dueDate: Date | null;
  dueTime: string;
  priority: string;
};

type EditTaskProps = {
  task: {
    id: string;
    title: string;
    description: string;
    dueDate?: string;
    dueTime?: string;
    priority?: string;
  };
  onUpdated?: (updatedTask: any) => void; // Accept updated task
};

export default function EditTask({ task, onUpdated }: EditTaskProps) {
  const [open, setOpen] = useState(false);

  // Parse dueDate string to Date object if present
  const initialDueDate =
    task.dueDate && !isNaN(Date.parse(task.dueDate))
      ? parse(task.dueDate, "MMMM d, yyyy", new Date())
      : null;

  const form = useForm<EditTaskForm>({
    defaultValues: {
      title: task.title,
      description: task.description,
      dueDate: initialDueDate,
      dueTime: task.dueTime || "",
      priority: task.priority || "none",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: EditTaskForm) {
    setLoading(true);
    const dueDateStr = values.dueDate
      ? format(values.dueDate, "MMMM d, yyyy")
      : "";
    await updateDoc(doc(db, "tasks", task.id), {
      title: values.title,
      description: values.description,
      dueDate: dueDateStr,
      dueTime: values.dueTime,
      priority: values.priority,
    });
    setLoading(false);
    setOpen(false);
    if (onUpdated)
      onUpdated({
        ...task,
        title: values.title,
        description: values.description,
        dueDate: dueDateStr,
        dueTime: values.dueTime,
        priority: values.priority,
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
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
                    <Input type="time" {...field} />
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
                        <RadioGroupItem value="none" id="priority-none-edit" />
                        <label htmlFor="priority-none-edit" className="flex items-center gap-1 cursor-pointer">
                          <Badge className="bg-gray-400 text-black">No Priority</Badge>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="low" id="priority-low-edit" />
                        <label htmlFor="priority-low-edit" className="flex items-center gap-1 cursor-pointer">
                          <Badge className="bg-yellow-400 text-black">Low</Badge>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="mid" id="priority-mid-edit" />
                        <label htmlFor="priority-mid-edit" className="flex items-center gap-1 cursor-pointer">
                          <Badge className="bg-orange-400 text-black">Mid</Badge>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="high" id="priority-high-edit" />
                        <label htmlFor="priority-high-edit" className="flex items-center gap-1 cursor-pointer">
                          <Badge className="bg-red-500 text-white">High</Badge>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                Cancel
                </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update"}
            </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}