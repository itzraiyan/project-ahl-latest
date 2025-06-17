
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AniListButton = () => {
  const handleAniListClick = () => {
    window.open("https://anilist.co/user/AstralArefin", "_blank");
  };

  return (
    <Button
      onClick={handleAniListClick}
      variant="outline"
      size="sm"
      className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
      title="View My AniList Profile"
    >
      <img 
        src="https://files.catbox.moe/w9obpo.svg" 
        alt="AniList" 
        className="w-4 h-4 rounded-full"
      />
      <span className="hidden sm:inline">AniList</span>
      <ExternalLink className="w-3 h-3" />
    </Button>
  );
};
