"use client";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "@/components/ui/menubar";

type SortOption = "dateAdded" | "dueDate" | "priority";

interface SortTaskProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  dateAdded: "Date Added",
  dueDate: "Due Date",
  priority: "Priority",
};

export default function SortTask({ sortBy, onSortChange }: SortTaskProps) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          Sort By: {sortLabels[sortBy]}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <MenubarRadioItem value="dateAdded">Date Added</MenubarRadioItem>
            <MenubarRadioItem value="dueDate">Due Date</MenubarRadioItem>
            <MenubarRadioItem value="priority">Priority</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}