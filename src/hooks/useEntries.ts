
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Entry {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  compressed_image_url?: string;
  original_image_url?: string;
  tags: string[];
  status: "Plan to Read" | "Reading" | "Paused" | "Completed" | "Dropped" | "Rereading";
  rating?: number;
  notes?: string;
  synopsis?: string;
  sources?: string[];
  total_chapters?: number;
  chapters_read?: number;
  start_date?: string;
  end_date?: string;
  total_repeats?: number;
  created_at: string;
  updated_at: string;
}

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching entries:", error);
        toast.error("Failed to fetch entries");
        return;
      }

      setEntries((data || []).map(entry => ({
        ...entry,
        status: entry.status as Entry["status"]
      })));
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to fetch entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addEntry = async (entry: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("entries")
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error("Error adding entry:", error);
        toast.error("Failed to add entry");
        return;
      }

      setEntries(prev => [{ ...data, status: data.status as Entry["status"] }, ...prev]);
      toast.success("Entry added successfully");
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry");
    }
  };

  const updateEntry = async (updatedEntry: Entry) => {
    try {
      const { error } = await supabase
        .from("entries")
        .update(updatedEntry)
        .eq("id", updatedEntry.id);

      if (error) {
        console.error("Error updating entry:", error);
        toast.error("Failed to update entry");
        return;
      }

      setEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));
      toast.success("Entry updated successfully");
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Failed to update entry");
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting entry:", error);
        toast.error("Failed to delete entry");
        return;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success("Entry deleted successfully");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const incrementChapter = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const newChaptersRead = (entry.chapters_read || 0) + 1;
    const isCompleted = entry.total_chapters && newChaptersRead >= entry.total_chapters;
    
    let updatedEntry: Partial<Entry> = {
      chapters_read: newChaptersRead
    };

    // Handle status transitions based on current status
    if (entry.status === "Plan to Read") {
      updatedEntry.status = "Reading";
      if (!entry.start_date) {
        updatedEntry.start_date = new Date().toISOString().split('T')[0];
      }
    } else if (entry.status === "Paused" || entry.status === "Dropped") {
      updatedEntry.status = "Reading";
      if (!entry.start_date) {
        updatedEntry.start_date = new Date().toISOString().split('T')[0];
      }
    } else if (entry.status === "Rereading") {
      // For rereading, increment total_repeats when completing a cycle
      if (isCompleted) {
        updatedEntry.total_repeats = (entry.total_repeats || 0) + 1;
        updatedEntry.chapters_read = 0; // Reset for next reread cycle
        updatedEntry.status = "Rereading"; // Keep as rereading
      }
    }

    // If we hit total chapters and not rereading, mark as completed
    if (isCompleted && entry.status !== "Rereading") {
      updatedEntry.status = "Completed";
      if (!entry.end_date) {
        updatedEntry.end_date = new Date().toISOString().split('T')[0];
      }
    }

    try {
      const { error } = await supabase
        .from("entries")
        .update(updatedEntry)
        .eq("id", id);

      if (error) {
        console.error("Error incrementing chapter:", error);
        toast.error("Failed to update chapter count");
        return;
      }

      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, ...updatedEntry } : e
      ));

      if (isCompleted && entry.status !== "Rereading") {
        toast.success("Completed! 🎉");
      } else if (entry.status === "Rereading" && isCompleted) {
        toast.success(`Reread completed! Total repeats: ${(entry.total_repeats || 0) + 1}`);
      } else {
        toast.success("Chapter updated");
      }
    } catch (error) {
      console.error("Error incrementing chapter:", error);
      toast.error("Failed to update chapter count");
    }
  };

  return {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    incrementChapter,
    refetch: fetchEntries
  };
};
