
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/EntryCard";
import type { Entry } from "@/hooks/useEntries";

interface PaginatedSectionProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onIncrementChapter?: (id: string) => void;
  isReadOnly: boolean;
  statusType: "Reading" | "Completed" | "Dropped" | "Plan to Read" | "Paused" | "Rereading";
}

const ITEMS_PER_PAGE = 12;

export const PaginatedSection = ({ 
  entries, 
  onEdit, 
  onDelete, 
  onIncrementChapter,
  isReadOnly, 
  statusType 
}: PaginatedSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEntries = entries.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentEntries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onIncrementChapter={onIncrementChapter}
            isReadOnly={isReadOnly}
            statusType={statusType}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 focus:text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 focus:text-white"
                    }
                  >
                    {page}
                  </Button>
                </div>
              ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 focus:text-white disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
