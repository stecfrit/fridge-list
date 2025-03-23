import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase";

type Item = Database["public"]["Tables"]["items"]["Row"];

interface ListItemProps {
  item: Item;
  isEditMode: boolean;
  onToggle: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

export function ListItem({
  item,
  isEditMode,
  onToggle,
  onDelete,
}: ListItemProps) {
  return (
    <li className="flex items-center p-2 rounded-lg">
      <div
        className="flex items-center flex-1 cursor-pointer"
        onClick={() => onToggle(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle(item)}
      >
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle(item)}
          className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer"
        />
        <span
          className={cn(
            "ml-2 flex-1",
            item.completed ? "line-through text-muted-foreground" : ""
          )}
        >
          {item.text}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(item.id)}
        className={cn(
          "ml-2 transition-opacity duration-200 text-destructive hover:text-destructive hover:bg-destructive/10",
          isEditMode ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
