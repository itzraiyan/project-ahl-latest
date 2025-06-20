
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Entry {
  id: string;
  title: string;
  author: string;
  cover_url: string;
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
  const { toast } = useToast();

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch entries",
          variant: "destructive"
        });
        return;
      }

      // Type cast the data to ensure status field matches our Entry type
      const typedEntries: Entry[] = (data || []).map(entry => ({
        ...entry,
        status: entry.status as Entry["status"]
      }));

      setEntries(typedEntries);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async (entryData: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([entryData])
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        toast({
          title: "Error",
          description: "Failed to add entry",
          variant: "destructive"
        });
        return;
      }

      // Type cast the returned data
      const typedEntry: Entry = {
        ...data,
        status: data.status as Entry["status"]
      };

      setEntries(prev => [typedEntry, ...prev]);
      toast({
        title: "Success",
        description: "Entry added successfully"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateEntry = async (updatedEntry: Entry) => {
    try {
      // Handle auto-dating logic
      const now = new Date().toISOString().split('T')[0];
      let newStartDate = updatedEntry.start_date;
      let newEndDate = updatedEntry.end_date;
      let newStatus = updatedEntry.status;

      // Find the current entry to compare status changes
      const currentEntry = entries.find(e => e.id === updatedEntry.id);
      
      // Auto start date when changing to Reading from Plan to Read
      if (currentEntry?.status === "Plan to Read" && updatedEntry.status === "Reading" && !newStartDate) {
        newStartDate = now;
      }
      
      // Auto end date when changing to Completed from Reading
      if (currentEntry?.status === "Reading" && updatedEntry.status === "Completed" && !newEndDate) {
        newEndDate = now;
      }
      
      // Auto change to Completed if end date is set manually
      if (newEndDate && !currentEntry?.end_date && updatedEntry.status === "Reading") {
        newStatus = "Completed";
      }

      // Prepare update data - explicitly handle null values for cleared fields
      const updateData = {
        title: updatedEntry.title,
        author: updatedEntry.author,
        cover_url: updatedEntry.cover_url,
        compressed_image_url: updatedEntry.compressed_image_url || null,
        original_image_url: updatedEntry.original_image_url || null,
        tags: updatedEntry.tags || [],
        status: newStatus,
        rating: updatedEntry.rating || null,
        notes: updatedEntry.notes || null,
        synopsis: updatedEntry.synopsis || null,
        sources: updatedEntry.sources || [],
        total_chapters: updatedEntry.total_chapters || null,
        chapters_read: updatedEntry.chapters_read || null,
        start_date: newStartDate || null,
        end_date: newEndDate || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('entries')
        .update(updateData)
        .eq('id', updatedEntry.id);

      if (error) {
        console.error('Error updating entry:', error);
        toast({
          title: "Error",
          description: "Failed to update entry",
          variant: "destructive"
        });
        return;
      }

      const finalEntry = { ...updatedEntry, start_date: newStartDate, end_date: newEndDate, status: newStatus, updated_at: new Date().toISOString() };
      setEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? finalEntry : entry
      ));
      
      toast({
        title: "Success",
        description: "Entry updated successfully"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const incrementChapter = async (id: string) => {
    try {
      const entry = entries.find(e => e.id === id);
      if (!entry) return;

      const currentChapters = entry.chapters_read || 0;
      const totalChapters = entry.total_chapters;
      
      // Don't allow increment beyond total chapters (if set)
      if (totalChapters && currentChapters >= totalChapters) return;

      const newChaptersRead = currentChapters + 1;
      let newStatus = entry.status;
      let newStartDate = entry.start_date;

      // Auto change status logic
      if (entry.status === "Plan to Read" || entry.status === "Dropped") {
        newStatus = "Reading";
        if (!newStartDate) {
          newStartDate = new Date().toISOString().split('T')[0];
        }
      }

      const updateData = {
        chapters_read: newChaptersRead,
        status: newStatus,
        start_date: newStartDate,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('entries')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error incrementing chapter:', error);
        toast({
          title: "Error",
          description: "Failed to update chapter count",
          variant: "destructive"
        });
        return;
      }

      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, chapters_read: newChaptersRead, status: newStatus, start_date: newStartDate, updated_at: new Date().toISOString() } : e
      ));

      toast({
        title: "Success",
        description: `Chapter count updated to ${newChaptersRead}`,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        toast({
          title: "Error",
          description: "Failed to delete entry",
          variant: "destructive"
        });
        return;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast({
        title: "Success",
        description: "Entry deleted successfully"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

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
