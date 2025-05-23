"use client";

import { useState } from "react";
import AddTask from "@/components/AddTask";
import TodoList from "@/components/TodoList";
import { Toaster } from "@/components/ui/sonner";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SortTask from "@/components/SortTask";
import CompletedTask from "@/components/CompletedTask";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortBy, setSortBy] = useState<"dateAdded" | "dueDate" | "priority">("dateAdded");

  const handleTaskAdded = () => setRefreshKey((k) => k + 1);
  const handleTaskChanged = () => setRefreshKey((k) => k + 1); // For completion toggle

  return (
    <>
      <main className="min-h-screen flex items-start justify-center p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Todo List: 2/3 */}
          <section className="md:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              {/* Add Task button on the left */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Add Task</DialogTitle>
                  <AddTask onTaskAdded={handleTaskAdded} />
                </DialogContent>
              </Dialog>
              {/* Sort By on the right */}
              <SortTask sortBy={sortBy} onSortChange={setSortBy} />
            </div>
            <TodoList
              refreshKey={refreshKey}
              sortBy={sortBy}
              onTaskChanged={handleTaskChanged}
            />
          </section>
          {/* Completed Tasks: 1/3 */}
          <section className="md:col-span-1 flex flex-col">
            <CompletedTask refreshKey={refreshKey} />
          </section>
        </div>
      </main>
      <Toaster />
    </>
  );
}