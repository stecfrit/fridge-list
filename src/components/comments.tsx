import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

type Comment = Database["public"]["Tables"]["comments"]["Row"];

interface CommentsProps {
  listId: string;
  className?: string;
}

export function Comments({ listId, className }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of comments
    fetchComments();

    // Set up realtime subscription
    const channel = supabase
      .channel(`comments:${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    setComments(data || []);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    const { error } = await supabase.from("comments").insert([
      {
        list_id: listId,
        content: newComment.trim(),
      },
    ]);

    if (error) {
      console.error("Error adding comment:", error);
      return;
    }

    setNewComment("");
    setIsLoading(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments</h3>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNewComment(e.target.value)
          }
          className="min-h-[80px]"
        />
        <Button
          onClick={addComment}
          disabled={isLoading || !newComment.trim()}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Add Comment
        </Button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 rounded-lg bg-muted/50 space-y-1"
          >
            <p className="text-sm">{comment.content}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
