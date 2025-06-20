
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAniList } from "@/hooks/useAniList";
import type { Entry } from "@/hooks/useEntries";

interface DashboardStatsProps {
  entries: Entry[];
}

export const DashboardStats = ({ entries }: DashboardStatsProps) => {
  const [aniListData, setAniListData] = useState<any>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { fetchUserStats } = useAniList();

  // Auto refresh AniList data every 12 hours
  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      
      // Check if we need to refresh (12 hours passed or no data)
      if (!aniListData || (now - lastFetch) > twelveHours) {
        console.log("Fetching fresh AniList data...");
        const data = await fetchUserStats("AstralArefin");
        if (data) {
          setAniListData(data);
          setLastFetch(now);
          localStorage.setItem('anilist_data', JSON.stringify(data));
          localStorage.setItem('anilist_last_fetch', now.toString());
        }
      }
    };

    // Load from localStorage on mount
    const storedData = localStorage.getItem('anilist_data');
    const storedLastFetch = localStorage.getItem('anilist_last_fetch');
    
    if (storedData && storedLastFetch) {
      setAniListData(JSON.parse(storedData));
      setLastFetch(parseInt(storedLastFetch));
    }

    fetchData();

    // Set up interval to check every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchUserStats]);

  const localStats = {
    totalEntries: entries.length,
    reading: entries.filter(e => e.status === "Reading").length,
    completed: entries.filter(e => e.status === "Completed").length,
    planToRead: entries.filter(e => e.status === "Plan to Read").length,
    totalChaptersRead: entries.reduce((sum, entry) => sum + (entry.chapters_read || 0), 0),
    averageRating: entries.filter(e => e.rating).length > 0 
      ? (entries.filter(e => e.rating).reduce((sum, entry) => sum + (entry.rating || 0), 0) / entries.filter(e => e.rating).length).toFixed(1)
      : "N/A"
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {aniListData?.totalManga || localStats.totalEntries}
          </div>
          <div className="text-sm text-gray-400">Total Manga</div>
          <div className="mt-2 h-0.5 bg-blue-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {aniListData?.chaptersRead || localStats.totalChaptersRead}
          </div>
          <div className="text-sm text-gray-400">Chapters Read</div>
          <div className="mt-2 h-0.5 bg-green-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {aniListData?.meanScore ? (aniListData.meanScore / 10).toFixed(1) : localStats.averageRating}
          </div>
          <div className="text-sm text-gray-400">Mean Score</div>
          <div className="mt-2 h-0.5 bg-yellow-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{localStats.reading}</div>
          <div className="text-sm text-gray-400">Reading</div>
          <div className="mt-2 h-0.5 bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">{localStats.completed}</div>
          <div className="text-sm text-gray-400">Completed</div>
          <div className="mt-2 h-0.5 bg-green-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-400 mb-1">{localStats.planToRead}</div>
          <div className="text-sm text-gray-400">Plan to Read</div>
          <div className="mt-2 h-0.5 bg-gray-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
        </CardContent>
      </Card>
    </div>
  );
};
