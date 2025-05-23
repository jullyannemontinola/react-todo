"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import DeleteTask from "@/components/DeleteTask";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

export default function CompletedTask({ refreshKey }: { refreshKey?: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Handler to mark task as not completed
  const handleToggleComplete = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), { completed: false });
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    // Notify parent to refresh TodoList
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('refresh-tasks'));
    }
  };

  useEffect(() => {
    async function fetchCompletedTasks() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "tasks"));
      let completedTasks: Task[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.completed) {
          completedTasks.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            completed: data.completed,
            dueDate: data.dueDate,
            dueTime: data.dueTime,
            dateAdded: data.dateAdded,
            priority: data.priority,
          });
        }
      });
      setTasks(completedTasks);
      setLoading(false);
    }
    fetchCompletedTasks();
  }, [refreshKey]);

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="w-full max-w-xl">
      <CardContent>
        <h2 className="font-bold text-lg mb-4">Completed Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-gray-500">No completed tasks.</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id} className="w-full mb-2 shadow-none border rounded-lg p-0">
                <div className="flex items-stretch min-h-0">
                  {/* Checkbox Section */}
                  <div className="flex items-center justify-center px-2 border-r">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleComplete(task)}
                      className="accent-blue-600 w-5 h-5"
                    />
                  </div>
                  {/* Main Content Section */}
                  <div className="flex-1 flex flex-col justify-center px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400 font-bold text-lg">
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
                    {task.dueDate && (
                      <div className="text-xs text-gray-400">
                        Due: {isNaN(Date.parse(task.dueDate))
                          ? task.dueDate
                          : format(new Date(task.dueDate), "MMMM d, yyyy")}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <DeleteTask
                        task={task}
                        onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                        onUndo={(restoredTask) => setTasks((prev) => [restoredTask as Task, ...prev])}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}