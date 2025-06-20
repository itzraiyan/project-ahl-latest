
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

      setEntries((data || []) as Entry[]);
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

      setEntries(prev => [data as Entry, ...prev]);
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
    
    // Auto date detection logic
    let updatedEntry: Partial<Entry> = {
      chapters_read: newChaptersRead
    };

    // If status is "Plan to Read" and we're incrementing for the first time, change to "Reading" and set start date
    if (entry.status === "Plan to Read" && newChaptersRead === 1) {
      updatedEntry.status = "Reading";
      if (!entry.start_date) {
        updatedEntry.start_date = new Date().toISOString().split('T')[0];
      }
    }

    // If we hit total chapters, mark as completed and set end date
    if (isCompleted) {
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

      if (isCompleted) {
        toast.success("Completed! 🎉");
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
