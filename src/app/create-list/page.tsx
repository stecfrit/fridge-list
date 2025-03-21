"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateList() {
  const [listName, setListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateList = async () => {
    if (!listName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("lists")
        .insert([{ name: listName.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Redirect to the list page
      router.push(`/list/${data.id}`);
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Failed to create list. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Create New List</h1>
          <p className="text-muted-foreground">
            Give your shopping list a name to get started
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter list name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={handleCreateList}
            className="w-full"
            disabled={!listName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create List"}
          </Button>
        </div>
      </main>
    </div>
  );
}
