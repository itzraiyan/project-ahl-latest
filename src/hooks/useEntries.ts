
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Entry {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  tags: string[];
  status: "Plan to Read" | "Reading" | "Paused" | "Completed" | "Dropped" | "Rereading";
  rating?: number;
  notes?: string;
  release_date?: string;
  synopsis?: string;
  source?: string;
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
      const { error } = await supabase
        .from('entries')
        .update({
          title: updatedEntry.title,
          author: updatedEntry.author,
          cover_url: updatedEntry.cover_url,
          tags: updatedEntry.tags,
          status: updatedEntry.status,
          rating: updatedEntry.rating,
          notes: updatedEntry.notes,
          release_date: updatedEntry.release_date,
          synopsis: updatedEntry.synopsis,
          source: updatedEntry.source,
          total_chapters: updatedEntry.total_chapters,
          chapters_read: updatedEntry.chapters_read,
          start_date: updatedEntry.start_date,
          end_date: updatedEntry.end_date,
          updated_at: new Date().toISOString()
        })
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

      setEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? { ...updatedEntry, updated_at: new Date().toISOString() } : entry
      ));
      toast({
        title: "Success",
        description: "Entry updated successfully"
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
    refetch: fetchEntries
  };
};
