"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string;
  reminder: boolean;
  completed?: boolean;
  dueDate?: string; // 'MM-DD-YYYY'
  dueTime?: string; // 'HH:mm'
  dateAdded?: string; // 'MM-DD-YYYY'
  priority?: number;
};

type TodoListProps = {
  refreshKey?: number;
};

export default function TodoList({ refreshKey }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const fetchedTasks: Task[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedTasks.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          reminder: data.reminder,
          completed: data.completed,
          dueDate: data.dueDate,
          dueTime: data.dueTime,
          dateAdded: data.dateAdded,
          priority: data.priority,
        });
      });
      setTasks(fetchedTasks);
      setLoading(false);
    }
    fetchTasks();
  }, [refreshKey]); // refetch when refreshKey changes

  async function handleAddTask(newTask: Omit<Task, "id">) {
    await addDoc(collection(db, "tasks"), {
      ...newTask,
      dateAdded: newTask.dateAdded || new Date().toLocaleDateString("en-US"),
      completed: false,
    });
    // Optionally re-fetch tasks or optimistically update state
  }

  // Update
  async function handleUpdateTask(id: string, updates: Partial<Task>) {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, updates);
  }

  // Delete with Undo
  async function handleDeleteTask(task: Task) {
    // delete from firestore
    await deleteDoc(doc(db, "tasks", task.id));
    // delete from ui/local state
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    toast("Task deleted", {
      description: <span style={{ color: "#393E46", fontWeight: "bold" }}>{`The "${task.title}" was deleted.`}</span>,
      action: {
        label: "Undo",
        onClick: async () => {
          const { id, ...taskData } = task;
          const docRef = await addDoc(collection(db, "tasks"), taskData);
          setTasks((prev) => [
            { ...task, id: docRef.id },
            ...prev,
          ]);
        },
      },
      duration: 5000,
    });
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>To-Do List</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-500">No tasks found.</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id} className="mb-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="accent-blue-600"
                    />
                    <span className={task.completed ? "line-through text-gray-400" : ""}>
                      {task.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-2">
                    Due: {task.dueDate} {task.dueTime}
                  </div>
                  <div className="mb-2">{task.description}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTask(task)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}