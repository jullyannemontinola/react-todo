"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DeleteTask from "@/components/DeleteTask";
import EditTask from "@/components/EditTask";

type Task = {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  dueDate?: string;
  dueTime?: string;
  dateAdded?: string;
  priority?: string;
};

type TodoListProps = {
  refreshKey?: number;
};

export default function TodoList({ refreshKey }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [refreshKey]);

  return (
    <Card className="w-full max-w-5xl">
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
              <Card
                key={task.id}
                className="w-full mb-2 shadow-none border rounded-lg p-0"
              >
                <div className="flex items-stretch min-h-0">
                  {/* Checkbox Section */}
                  <div className="flex items-center justify-center px-2 border-r">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="accent-blue-600 w-5 h-5"
                    />
                  </div>
                  {/* Main Content Section */}
                  <div className="flex-1 flex flex-col justify-center px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          (task.completed ? "line-through text-gray-400 " : "") +
                          "font-bold text-lg"
                        }
                      >
                        {task.title}
                      </span>
                      {task.priority === "low" && (
                        <Badge className="bg-yellow-400 text-black ml-2">Low Priority</Badge>
                      )}
                      {task.priority === "mid" && (
                        <Badge className="bg-orange-400 text-black ml-2">Mid Priority</Badge>
                      )}
                      {task.priority === "high" && (
                        <Badge className="bg-red-500 text-white ml-2">High Priority</Badge>
                      )}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500">{task.description}</div>
                    )}
                    {task.dateAdded && (
                      <div className="text-xs text-gray-400">
                        Added: {isNaN(Date.parse(task.dateAdded))
                          ? task.dateAdded
                          : format(new Date(task.dateAdded), "MMMM d, yyyy")}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <EditTask
                        task={task}
                        onUpdated={(updatedTask) => {
                          setTasks((prev) =>
                            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
                          );
                        }}
                      />
                      <DeleteTask
                        task={task}
                        onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                        onUndo={(restoredTask) => setTasks((prev) => [restoredTask as Task, ...prev])}
                      />
                    </div>
                  </div>
                  {/* Due Date/Time Section */}
                  {(task.dueDate || task.dueTime) && (
                    <div className="flex flex-col items-end justify-center px-4 min-w-[90px] border-l">
                      {task.dueDate && !isNaN(Date.parse(task.dueDate)) && (
                        <span className="text-sm text-purple-700 font-semibold">
                          {format(new Date(task.dueDate), "d MMMM")}
                        </span>
                      )}
                      {task.dueTime && (
                        <span className="text-xs text-gray-500">{task.dueTime}</span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}