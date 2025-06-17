
import { useAniList } from "@/hooks/useAniList";
import type { Entry } from "@/hooks/useEntries";

interface DashboardStatsProps {
  entries: Entry[];
}

export const DashboardStats = ({ entries }: DashboardStatsProps) => {
  const { stats: anilistStats, isLoading, error } = useAniList();

  // Fallback to local stats if AniList fails
  const localStats = {
    totalManga: entries.length,
    chaptersRead: entries.reduce((total, entry) => total + (entry.chapters_read || 0), 0),
    meanScore: entries.length > 0 
      ? entries.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / entries.filter(e => e.rating).length
      : 0
  };

  const displayStats = anilistStats || {
    count: localStats.totalManga,
    chaptersRead: localStats.chaptersRead,
    meanScore: localStats.meanScore
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-center items-center space-x-6">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400 animate-pulse">--</div>
            <div className="text-xs text-gray-400">Total Manga</div>
          </div>
          <div className="text-gray-600 text-sm">|</div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400 animate-pulse">--</div>
            <div className="text-xs text-gray-400">Chapters Read</div>
          </div>
          <div className="text-gray-600 text-sm">|</div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400 animate-pulse">--</div>
            <div className="text-xs text-gray-400">Mean Score</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex justify-center items-center space-x-6 text-center">
        <div className="flex-1">
          <div className="text-lg font-bold text-blue-400">
            {displayStats.count}
          </div>
          <div className="text-xs text-gray-400">Total Manga</div>
        </div>
        
        <div className="text-gray-600 text-sm">|</div>
        
        <div className="flex-1">
          <div className="text-lg font-bold text-blue-400">
            {displayStats.chaptersRead.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Chapters Read</div>
        </div>
        
        <div className="text-gray-600 text-sm">|</div>
        
        <div className="flex-1">
          <div className="text-lg font-bold text-blue-400">
            {displayStats.meanScore ? displayStats.meanScore.toFixed(1) : '0.0'}
          </div>
          <div className="text-xs text-gray-400">Mean Score</div>
        </div>
      </div>
      
      {error && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Using local data (AniList unavailable)
        </div>
      )}
    </div>
  );
};
