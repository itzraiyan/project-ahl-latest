
import { useState } from "react";
import { useAniList } from "@/hooks/useAniList";
import type { Entry } from "@/hooks/useEntries";

interface DashboardStatsProps {
  entries: Entry[];
}

export const DashboardStats = ({ entries }: DashboardStatsProps) => {
  const { stats: anilistStats, isLoading, error } = useAniList();
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate local stats
  const localStats = {
    totalManga: entries.length,
    chaptersRead: entries.reduce((acc, entry) => acc + (entry.chapters_read || 0), 0),
    meanScore: entries.length > 0 
      ? entries.filter(entry => entry.rating).reduce((acc, entry) => acc + (entry.rating || 0), 0) / entries.filter(entry => entry.rating).length
      : 0
  };

  // Combine AniList and local stats
  const combinedStats = {
    count: (anilistStats?.count || 0) + localStats.totalManga,
    chaptersRead: (anilistStats?.chaptersRead || 0) + localStats.chaptersRead,
    meanScore: (() => {
      const anilistScore = anilistStats?.meanScore || 0;
      const anilistCount = anilistStats?.count || 0;
      const localScore = localStats.meanScore || 0;
      const localCount = entries.filter(entry => entry.rating).length;
      
      if (anilistCount === 0 && localCount === 0) return 0;
      if (anilistCount === 0) return localScore;
      if (localCount === 0) return anilistScore;
      
      // Calculate weighted average
      return ((anilistScore * anilistCount) + (localScore * localCount)) / (anilistCount + localCount);
    })()
  };

  const toggleBreakdown = () => {
    setShowBreakdown(!showBreakdown);
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-center items-center space-x-6">
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-blue-400 animate-pulse">--</div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Total&nbsp;Manga</div>
          </div>
          <div className="text-gray-600 text-sm">|</div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-blue-400 animate-pulse">--</div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Chapters&nbsp;Read</div>
          </div>
          <div className="text-gray-600 text-sm">|</div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-blue-400 animate-pulse">--</div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Mean&nbsp;Score</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Main Dashboard */}
      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-center items-center space-x-6 text-center">
          <div 
            className="flex-1 cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors duration-200"
            onClick={toggleBreakdown}
          >
            <div className="text-lg font-bold text-blue-400">
              {combinedStats.count}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Total&nbsp;Manga</div>
          </div>
          
          <div className="text-gray-600 text-sm">|</div>
          
          <div 
            className="flex-1 cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors duration-200"
            onClick={toggleBreakdown}
          >
            <div className="text-lg font-bold text-blue-400">
              {combinedStats.chaptersRead.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Chapters&nbsp;Read</div>
          </div>
          
          <div className="text-gray-600 text-sm">|</div>
          
          <div 
            className="flex-1 cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors duration-200"
            onClick={toggleBreakdown}
          >
            <div className="text-lg font-bold text-blue-400">
              {combinedStats.meanScore ? combinedStats.meanScore.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Mean&nbsp;Score</div>
          </div>
        </div>
        
        {error && (
          <div className="text-xs text-gray-500 text-center mt-2">
            AniList unavailable - showing combined with local data
          </div>
        )}
      </div>

      {/* Breakdown Panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showBreakdown ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="mt-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex justify-center items-center space-x-6 text-center text-sm">
            <div className="flex-1">
              <div className="text-gray-300 mb-1">AniList: {anilistStats?.count || 0}</div>
              <div className="text-gray-400">+ Local: {localStats.totalManga}</div>
            </div>
            
            <div className="text-gray-600 text-sm">|</div>
            
            <div className="flex-1">
              <div className="text-gray-300 mb-1">AniList: {(anilistStats?.chaptersRead || 0).toLocaleString()}</div>
              <div className="text-gray-400">+ Local: {localStats.chaptersRead.toLocaleString()}</div>
            </div>
            
            <div className="text-gray-600 text-sm">|</div>
            
            <div className="flex-1">
              <div className="text-gray-300 mb-1">Combined</div>
              <div className="text-gray-400">Avg: {combinedStats.meanScore ? combinedStats.meanScore.toFixed(1) : '0.0'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
