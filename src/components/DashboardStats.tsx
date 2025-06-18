import { useState } from "react";
import { useAniList } from "@/hooks/useAniList";
import { BarChart3, BookOpen, Star, ChevronDown, ChevronUp, TrendingUp, Database } from "lucide-react";
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
      {/* Main Dashboard - Restored to original */}
      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-center items-center">
          {/* Total Manga */}
          <div 
            className="flex-1 text-center cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors duration-200"
            onClick={toggleBreakdown}
          >
            <div className="text-lg font-bold text-blue-400">
              {combinedStats.count}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Total&nbsp;Manga</div>
          </div>
          
          {/* Separator */}
          <div className="text-gray-600 text-sm px-4">|</div>
          
          {/* Chapters Read */}
          <div 
            className="flex-1 text-center cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors duration-200"
            onClick={toggleBreakdown}
          >
            <div className="text-lg font-bold text-blue-400">
              {combinedStats.chaptersRead.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Chapters&nbsp;Read</div>
          </div>
          
          {/* Separator */}
          <div className="text-gray-600 text-sm px-4">|</div>
          
          {/* Mean Score */}
          <div 
            className="flex-1 text-center cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors duration-200"
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

      {/* Breakdown Panel - Horizontal layout matching main dashboard */}
      <div className={`transition-all duration-300 ease-in-out ${
        showBreakdown ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
      } overflow-hidden`}>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex justify-center items-center">
            {/* Total Manga Breakdown */}
            <div className="flex-1 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span className="text-gray-400">AniList:</span>
                  <span className="font-bold text-sky-400">{anilistStats?.count || 0}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400">Local:</span>
                  <span className="font-bold text-green-400">{localStats.totalManga}</span>
                </div>
              </div>
            </div>
            
            {/* Separator */}
            <div className="text-gray-600 text-sm px-4">|</div>
            
            {/* Chapters Read Breakdown */}
            <div className="flex-1 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span className="text-gray-400">AniList:</span>
                  <span className="font-bold text-sky-400">{(anilistStats?.chaptersRead || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400">Local:</span>
                  <span className="font-bold text-green-400">{localStats.chaptersRead.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Separator */}
            <div className="text-gray-600 text-sm px-4">|</div>
            
            {/* Mean Score Breakdown */}
            <div className="flex-1 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span className="text-gray-400">AniList:</span>
                  <span className="font-bold text-sky-400">
                    {anilistStats?.meanScore ? anilistStats.meanScore.toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400">Local:</span>
                  <span className="font-bold text-green-400">
                    {localStats.meanScore ? localStats.meanScore.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
