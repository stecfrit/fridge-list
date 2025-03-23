"use client";

import { useState, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { useList } from "@/hooks/use-list";
import { QRCode } from "@/components/qr-code";
import { ListItem } from "@/components/list-item";
import { MobileCopyButton } from "@/components/mobile-copy-button";
import { Database } from "@/lib/supabase";

type Item = Database["public"]["Tables"]["items"]["Row"];

export default function ListPage() {
  const params = useParams();
  const [newItem, setNewItem] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { list, items, isLoading, addItem, toggleItem, deleteItem } = useList(
    params.id as string
  );

  const handleCopyUrl = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      await addItem(newItem);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleToggleItem = async (item: Item) => {
    try {
      await toggleItem(item);
    } catch (error) {
      console.error("Error toggling item:", error);
      alert("Failed to update item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">loading...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">list not found</p>
      </div>
    );
  }

  const listUrl = `${window.location.origin}/list/${list.id}`;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <main className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold">{list.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyUrl}
              className="h-8 w-8 hidden md:flex"
              title="Copy URL"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <QRCode url={listUrl} />
        </div>

        <div className="space-y-4">
          <div className="flex gap-1 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <Input
                type="text"
                placeholder="add new item"
                value={newItem}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewItem(e.target.value)
                }
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" && handleAddItem()
                }
              />
              <Button className="font-mono" onClick={handleAddItem}>
                add
              </Button>
            </div>
            <Button
              variant="secondary"
              size="default"
              onClick={() => setIsEditMode(!isEditMode)}
              className="h-9 font-mono"
              title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
            >
              {isEditMode ? "done" : "edit"}
            </Button>
          </div>

          <ul className="mb-20">
            {items.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                isEditMode={isEditMode}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </ul>
        </div>
      </main>
      <MobileCopyButton isCopied={isCopied} onCopy={handleCopyUrl} />
    </div>
  );
}
