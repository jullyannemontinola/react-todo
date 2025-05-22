"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";

type Task = {
  id: string;
  title: string;
  [key: string]: any;
};

type DeleteTaskProps = {
  task: Task;
  onDeleted?: (id: string) => void;
  onUndo?: (restoredTask: Task) => void;
};

export default function DeleteTask({ task, onDeleted, onUndo }: DeleteTaskProps) {
  const handleDelete = async () => {
    await deleteDoc(doc(db, "tasks", task.id));
    onDeleted?.(task.id);

    toast("Task deleted", {
      description: (
        <span style={{ color: "#393E46", fontWeight: "bold" }}>
          {`The "${task.title}" was deleted.`}
        </span>
      ),
      action: {
        label: "Undo",
        onClick: async () => {
          const { id, ...taskData } = task;
          const docRef = await addDoc(collection(db, "tasks"), taskData);
          const restoredTask = { ...task, id: docRef.id };
          onUndo?.(restoredTask);
        },
      },
      duration: 5000,
    });
  };

    return (
    <Button
        className="bg-red-500 text-white hover:bg-red-400 border-none"
        size="sm"
        onClick={handleDelete}
    >
        Delete
    </Button>
    );
}