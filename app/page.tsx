"use client";

import { useState } from "react";
import AddTask from "@/components/AddTask";
import TodoList from "@/components/TodoList";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  // This function will be passed to AddTask and called after a task is added
  const handleTaskAdded = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <main className="min-h-screen flex items-start justify-center p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Task: 1/3 */}
          <section className="md:col-span-1">
            <AddTask onTaskAdded={handleTaskAdded} />
          </section>
          {/* Todo List: 2/3 */}
          <section className="md:col-span-1">
            <TodoList refreshKey={refreshKey} />
          </section>
        </div>
      </main>
      <Toaster />
    </>
  );
}
