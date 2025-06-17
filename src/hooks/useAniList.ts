
import { useState, useEffect } from "react";

interface AniListStats {
  count: number;
  chaptersRead: number;
  meanScore: number;
  siteUrl: string;
}

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const ANILIST_USERNAME = "AstralArefin";
const CACHE_KEY = "anilist_stats";
const CACHE_TIMESTAMP_KEY = "anilist_stats_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const ANILIST_QUERY = `
query ($name: String) {
  User(name: $name) {
    statistics {
      manga {
        count
        chaptersRead
        meanScore
      }
    }
    siteUrl
  }
}
`;

export const useAniList = () => {
  const [stats, setStats] = useState<AniListStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAniListStats = async () => {
    try {
      const response = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: ANILIST_QUERY,
          variables: {
            name: ANILIST_USERNAME,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AniList data");
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error("AniList API error");
      }

      const user = data.data.User;
      const mangaStats = user.statistics.manga;

      const anilistStats: AniListStats = {
        count: mangaStats.count,
        chaptersRead: mangaStats.chaptersRead,
        meanScore: mangaStats.meanScore,
        siteUrl: user.siteUrl,
      };

      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(anilistStats));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      setStats(anilistStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching AniList stats:", err);
      setError("Failed to load AniList stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have cached data
    const cachedStats = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (cachedStats && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      const now = Date.now();

      // If cached data is less than 24 hours old, use it
      if (now - timestamp < CACHE_DURATION) {
        setStats(JSON.parse(cachedStats));
        setIsLoading(false);
        return;
      }
    }

    // Fetch new data
    fetchAniListStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchAniListStats };
};
