"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DeleteTask from "@/components/DeleteTask";
import EditTask from "@/components/EditTask";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

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
  sortBy?: "dateAdded" | "dueDate" | "priority";
  onTaskChanged?: () => void; // Add this
};

export default function TodoList({ refreshKey, sortBy = "dateAdded", onTaskChanged }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const TASKS_PER_PAGE = 3;

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "tasks"));
      let fetchedTasks: Task[] = [];
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

      // Sort logic
      type Priority = "high" | "mid" | "low" | "none";
      fetchedTasks = fetchedTasks.sort((a, b) => {
        if (sortBy === "dateAdded") {
          // Ascending
          return new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
        }
        if (sortBy === "dueDate") {
          // Ascending
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
        }
        if (sortBy === "priority") {
          // Highest priority first: high > mid > low > none
          const priorityOrder: Record<Priority, number> = { high: 3, mid: 2, low: 1, none: 0 };
          return (
            (priorityOrder[(b.priority || "none") as Priority] ?? 0) -
            (priorityOrder[(a.priority || "none") as Priority] ?? 0)
          );
        }
        return 0;
      });

      setTasks(fetchedTasks);
      setLoading(false);
    }
    fetchTasks();
  }, [refreshKey, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length]);

  useEffect(() => {
    const refreshHandler = () => {
      // You can call your fetchTasks or trigger a refreshKey update here
      if (typeof onTaskChanged === 'function') {
        onTaskChanged();
      }
    };
    window.addEventListener('refresh-tasks', refreshHandler);
    return () => {
      window.removeEventListener('refresh-tasks', refreshHandler);
    };
  }, [onTaskChanged]);

  const handleToggleComplete = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), { completed: !task.completed });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
    if (onTaskChanged) onTaskChanged(); // Notify parent to refresh
  };

  // Only show tasks that are not completed
  const activeTasks = tasks.filter((task) => !task.completed);

  const totalPages = Math.ceil(activeTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = activeTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  useEffect(() => {
    // If the current page is now empty but there are still tasks, go to the previous page
    if (
      currentPage > 1 &&
      paginatedTasks.length === 0 &&
      activeTasks.length > 0
    ) {
      setCurrentPage(currentPage - 1);
    }
  }, [activeTasks.length, paginatedTasks.length, currentPage]);

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
          <>
            <ul className="space-y-2">
              {paginatedTasks.map((task) => (
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
                        onChange={() => handleToggleComplete(task)}
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
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}