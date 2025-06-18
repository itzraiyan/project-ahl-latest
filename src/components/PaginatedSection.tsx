
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/EntryCard";
import type { Entry } from "@/hooks/useEntries";

interface PaginatedSectionProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  isReadOnly: boolean;
  statusType: "Reading" | "Completed" | "Dropped" | "Plan to Read" | "Paused" | "Rereading";
}

export const PaginatedSection = ({ entries, onEdit, onDelete, isReadOnly, statusType }: PaginatedSectionProps) => {
  const [visibleRows, setVisibleRows] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate entries per row based on screen size (responsive grid)
  const getEntriesPerRow = () => {
    // This matches the grid classes: grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1536) return 10; // 2xl
      if (width >= 1280) return 8;  // xl
      if (width >= 1024) return 6;  // lg
      if (width >= 768) return 5;   // md
      if (width >= 640) return 4;   // sm
      return 3; // default
    }
    return 6; // fallback for SSR
  };

  const entriesPerRow = getEntriesPerRow();
  const totalEntriesToShow = visibleRows * entriesPerRow;
  const visibleEntries = entries.slice(0, totalEntriesToShow);
  const hasMore = entries.length > totalEntriesToShow;

  const handleLoadMore = async () => {
    setIsLoading(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setVisibleRows(prev => prev + 4);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Grid of entries */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 auto-fit">
        {visibleEntries.map((entry, index) => (
          <div
            key={entry.id}
            className="animate-fade-in"
            style={{ animationDelay: `${(index % entriesPerRow) * 0.1}s` }}
          >
            <EntryCard
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
              isReadOnly={isReadOnly}
              statusType={statusType}
            />
          </div>
        ))}
      </div>

      {/* Load More button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${entries.length - totalEntriesToShow} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
