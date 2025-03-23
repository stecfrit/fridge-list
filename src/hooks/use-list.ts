import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type List = Database["public"]["Tables"]["lists"]["Row"];
type Item = Database["public"]["Tables"]["items"]["Row"];

export function useList(listId: string) {
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const { data: listData, error: listError } = await supabase
          .from("lists")
          .select()
          .eq("id", listId)
          .single();

        if (listError) throw listError;
        setList(listData);

        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select()
          .eq("list_id", listId)
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

    const channel = supabase
      .channel(`items-${listId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          setItems((prev) => [...prev, payload.new as Item]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
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
          if (!payload.old || !payload.old.id) {
            console.error("Invalid DELETE payload:", payload);
            return;
          }
          setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [listId]);

  const addItem = async (text: string) => {
    if (!text.trim() || !list) return;

    try {
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            list_id: list.id,
            text: text.trim(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  const toggleItem = async (item: Item) => {
    try {
      const { data, error } = await supabase
        .from("items")
        .update({ completed: !item.completed })
        .eq("id", item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error toggling item:", error);
      throw error;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", itemId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  return {
    list,
    items,
    isLoading,
    addItem,
    toggleItem,
    deleteItem,
  };
}
