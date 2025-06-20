import { useEffect, useState } from "react";
import { useAniList } from "@/hooks/useAniList";
import type { Entry } from "@/hooks/useEntries";

interface DashboardStatsProps {
  entries: Entry[];
}

export const DashboardStats = ({ entries }: DashboardStatsProps) => {
  // AniList refetching logic
  const [anilistStats, setAniListStats] = useState<any>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { stats, refetch, isLoading, error } = useAniList();
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      if (!anilistStats || (now - lastFetch) > twelveHours) {
        await refetch();
        if (stats) {
          setAniListStats(stats);
          setLastFetch(now);
          localStorage.setItem('anilist_data', JSON.stringify(stats));
          localStorage.setItem('anilist_last_fetch', now.toString());
        }
      }
    };

    // Load from localStorage on mount
    const storedData = localStorage.getItem('anilist_data');
    const storedLastFetch = localStorage.getItem('anilist_last_fetch');
    if (storedData && storedLastFetch) {
      setAniListStats(JSON.parse(storedData));
      setLastFetch(parseInt(storedLastFetch));
    }

    // Use stats from hook if available
    if (stats) {
      setAniListStats(stats);
    }

    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [stats, refetch]);

  // Format numbers like 1K, 1.5M, etc.
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num?.toString() ?? "0";
  };

  // Local stats
  const localStats = {
    totalManga: entries.length,
    chaptersRead: entries.reduce((acc, entry) => acc + (entry.chapters_read || 0), 0),
    meanScore: entries.filter(entry => entry.rating).length > 0
      ? entries.filter(entry => entry.rating).reduce((acc, entry) => acc + (entry.rating || 0), 0) / entries.filter(entry => entry.rating).length
      : 0
  };

  // AniList stats
  const aniStats = {
    totalManga: anilistStats?.count ?? 0,
    chaptersRead: anilistStats?.chaptersRead ?? 0,
    meanScore: typeof anilistStats?.meanScore === "number"
      ? anilistStats.meanScore
      : 0,
    meanScoreCount: typeof anilistStats?.count === "number" ? anilistStats.count : 0
  };

  // Weighted mean score calculation
  const localCount = entries.filter(entry => entry.rating).length;
  const combinedMeanScore = (() => {
    if (aniStats.meanScoreCount === 0 && localCount === 0) return 0;
    if (aniStats.meanScoreCount === 0) return localStats.meanScore;
    if (localCount === 0) return aniStats.meanScore;
    return ((aniStats.meanScoreCount * aniStats.meanScore) + (localCount * localStats.meanScore)) / (aniStats.meanScoreCount + localCount);
  })();

  // Combined stats for main dashboard
  const combinedStats = {
    count: aniStats.totalManga + localStats.totalManga,
    chaptersRead: aniStats.chaptersRead + localStats.chaptersRead,
    meanScore: combinedMeanScore
  };

  const toggleBreakdown = () => setShowBreakdown(!showBreakdown);

  if (isLoading) {
    return (
      <div className="mb-6 py-3 px-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-center items-center space-x-6">
          <div className="text-center flex-1 min-w-0">
            <div className="text-lg font-bold animate-pulse truncate text-primary">--</div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Total&nbsp;Manga</div>
          </div>
          <div className="text-gray-600 text-sm">|</div>
          <div className="text-center flex-1 min-w-0">
            <div className="text-lg font-bold animate-pulse truncate text-primary">--</div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Chapters&nbsp;Read</div>
          </div>
          <div className="text-gray-600 text-sm">|</div>
          <div className="text-center flex-1 min-w-0">
            <div className="text-lg font-bold animate-pulse truncate text-primary">--</div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Mean&nbsp;Score</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Main Dashboard - Combined stats */}
      <div className="py-3 px-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-center items-center">
          {/* Total Manga */}
          <div
            className="flex-1 text-center cursor-pointer hover:bg-gray-800 rounded py-1.5 mx-1 transition-colors duration-200 min-w-0"
            onClick={toggleBreakdown}
          >
            <div
              className="text-lg font-bold truncate"
              style={{ color: "#0096FF" }}
            >
              {formatNumber(combinedStats.count)}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Total&nbsp;Manga</div>
          </div>

          <div className="text-gray-600 text-sm px-2">|</div>

          {/* Chapters Read */}
          <div
            className="flex-1 text-center cursor-pointer hover:bg-gray-800 rounded py-1.5 mx-1 transition-colors duration-200 min-w-0"
            onClick={toggleBreakdown}
          >
            <div
              className="text-lg font-bold truncate"
              style={{ color: "#0096FF" }}
            >
              {formatNumber(combinedStats.chaptersRead)}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Chapters&nbsp;Read</div>
          </div>

          <div className="text-gray-600 text-sm px-2">|</div>

          {/* Mean Score */}
          <div
            className="flex-1 text-center cursor-pointer hover:bg-gray-800 rounded py-1.5 mx-1 transition-colors duration-200 min-w-0"
            onClick={toggleBreakdown}
          >
            <div
              className="text-lg font-bold truncate"
              style={{ color: "#0096FF" }}
            >
              {combinedStats.meanScore ? combinedStats.meanScore.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs font-bold text-gray-400 whitespace-nowrap">Mean&nbsp;Score</div>
          </div>
        </div>
        {error && (
          <div className="text-xs text-gray-500 text-center mt-1">
            AniList unavailable - showing combined with local data
          </div>
        )}
      </div>

      {/* Breakdown Panel - shows AniList + Local side by side */}
      <div className={`transition-all duration-300 ease-in-out ${
        showBreakdown ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
      } overflow-hidden`}>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex justify-center items-center">
            {/* Total Manga Breakdown */}
            <div className="flex-1 text-center min-w-0 mx-1">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sky-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 flex-shrink-0">AniList:</span>
                  <span className="font-bold text-sky-400 truncate">{formatNumber(aniStats.totalManga)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 flex-shrink-0">Local:</span>
                  <span className="font-bold text-green-400 truncate">{formatNumber(localStats.totalManga)}</span>
                </div>
              </div>
            </div>

            <div className="text-gray-600 text-sm px-2">|</div>

            {/* Chapters Read Breakdown */}
            <div className="flex-1 text-center min-w-0 mx-1">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sky-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 flex-shrink-0">AniList:</span>
                  <span className="font-bold text-sky-400 truncate">{formatNumber(aniStats.chaptersRead)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 flex-shrink-0">Local:</span>
                  <span className="font-bold text-green-400 truncate">{formatNumber(localStats.chaptersRead)}</span>
                </div>
              </div>
            </div>

            <div className="text-gray-600 text-sm px-2">|</div>

            {/* Mean Score Breakdown */}
            <div className="flex-1 text-center min-w-0 mx-1">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sky-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 flex-shrink-0">AniList:</span>
                  <span className="font-bold text-sky-400 truncate">
                    {typeof aniStats.meanScore === "number" ? aniStats.meanScore.toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 flex-shrink-0">Local:</span>
                  <span className="font-bold text-green-400 truncate">
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
