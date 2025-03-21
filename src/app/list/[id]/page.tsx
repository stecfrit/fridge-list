"use client";

import { useEffect, useState, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type List = Database["public"]["Tables"]["lists"]["Row"];
type Item = Database["public"]["Tables"]["items"]["Row"];

export default function ListPage() {
  const params = useParams();
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial list and items data
    const fetchList = async () => {
      try {
        // Fetch list details
        const { data: listData, error: listError } = await supabase
          .from("lists")
          .select()
          .eq("id", params.id)
          .single();

        if (listError) throw listError;
        setList(listData);

        // Fetch list items
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select()
          .eq("list_id", params.id)
          .order("created_at", { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (error) {
        console.error("Error fetching list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();

    // Set up real-time subscriptions
    const channel = supabase
      .channel(`items-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${params.id}`,
        },
        (payload) => {
          console.log("Received INSERT event:", payload);
          setItems((prev) => [...prev, payload.new as Item]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${params.id}`,
        },
        (payload) => {
          console.log("Received UPDATE event:", payload);
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id ? (payload.new as Item) : item
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "items",
        },
        (payload) => {
          console.log("Received DELETE event:", {
            payload,
            oldData: payload.old,
            listId: params.id,
            currentItems: items,
          });

          // Check if payload.old exists and has the expected structure
          if (!payload.old || !payload.old.id) {
            console.error("Invalid DELETE payload:", payload);
            return;
          }

          // Log before state update
          console.log("Current items before delete:", items);

          setItems((prev) => {
            const newItems = prev.filter((item) => item.id !== payload.old.id);
            console.log("Items after delete filter:", newItems);
            return newItems;
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Failed to subscribe to real-time updates");
        }
      });

    // Store channel reference for cleanup
    const channelRef = channel;

    return () => {
      console.log("Unsubscribing from channel");
      channelRef.unsubscribe();
    };
  }, [params.id]);

  const handleAddItem = async () => {
    if (!newItem.trim() || !list) return;

    try {
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            list_id: list.id,
            text: newItem.trim(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      console.log("Added item:", data);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleToggleItem = async (item: Item) => {
    try {
      const { data, error } = await supabase
        .from("items")
        .update({ completed: !item.completed })
        .eq("id", item.id)
        .select()
        .single();

      if (error) throw error;
      console.log("Updated item:", data);
    } catch (error) {
      console.error("Error toggling item:", error);
      alert("Failed to update item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", itemId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">List not found</p>
      </div>
    );
  }

  const listUrl = `${window.location.origin}/list/${list.id}`;

  return (
    <div className="min-h-screen p-4">
      <main className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{list.name}</h1>
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <QRCodeSVG value={listUrl} size={200} />
              <p className="mt-2 text-sm text-gray-500">
                Scan to access this list
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add new item"
              value={newItem}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewItem(e.target.value)
              }
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleAddItem()
              }
            />
            <Button onClick={handleAddItem}>Add</Button>
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 p-2 bg-white rounded-lg shadow"
              >
                <div
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => handleToggleItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleToggleItem(item)}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span
                    className={cn(
                      "ml-2 flex-1",
                      item.completed ? "line-through text-gray-500" : ""
                    )}
                  >
                    {item.text}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-2"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
