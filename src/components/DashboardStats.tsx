
import { Badge } from "@/components/ui/badge";
import type { Entry } from "@/hooks/useEntries";

interface DashboardStatsProps {
  entries: Entry[];
}

export const DashboardStats = ({ entries }: DashboardStatsProps) => {
  const totalManga = entries.length;
  
  const chaptersRead = entries.reduce((total, entry) => {
    return total + (entry.chapters_read || 0);
  }, 0);
  
  const completedEntries = entries.filter(entry => entry.status === "Completed" && entry.rating);
  const meanScore = completedEntries.length > 0 
    ? (completedEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / completedEntries.length).toFixed(1)
    : "0.0";

  return (
    <div className="flex justify-center items-center gap-8 py-6 mb-8 border-b border-gray-800">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">{totalManga}</div>
        <div className="text-sm text-gray-400">Total Manga</div>
      </div>
      
      <div className="w-px h-12 bg-gray-700" />
      
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">{chaptersRead}</div>
        <div className="text-sm text-gray-400">Chapters Read</div>
      </div>
      
      <div className="w-px h-12 bg-gray-700" />
      
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">{meanScore}</div>
        <div className="text-sm text-gray-400">Mean Score</div>
      </div>
    </div>
  );
};
