import { useState } from "react";
import { Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/Skeleton"; // NEW: import Skeleton
import type { Entry } from "@/hooks/useEntries";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  isReadOnly: boolean;
  statusType: "Reading" | "Completed" | "Dropped" | "Plan to Read" | "Paused" | "Rereading";
}

const statusColors: Record<string, string> = {
  "Plan to Read": "bg-gray-500",
  "Reading": "bg-blue-500",
  "Paused": "bg-yellow-500",
  "Completed": "bg-green-500",
  "Dropped": "bg-red-500",
  "Rereading": "bg-purple-500"
};

export const EntryCard = ({ entry, onEdit, onDelete, isReadOnly, statusType }: EntryCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // NEW: loading state for main card image
  const [imageLoading, setImageLoading] = useState(true);
  // NEW: loading state for detail dialog image
  const [detailImageLoading, setDetailImageLoading] = useState(true);

  // Use compressed image for card view, fallback to cover_url
  const cardImageUrl = entry.compressed_image_url || entry.cover_url;
  // Use original image for detail view, fallback to cover_url
  const detailImageUrl = entry.original_image_url || entry.cover_url;

  const renderSingleStar = (rating?: number) => {
    if (!rating) return null;

    // Determine star color based on rating
    const getStarColor = (rating: number) => {
      if (rating >= 8) return "text-green-400 fill-green-400";
      if (rating >= 6) return "text-yellow-400 fill-yellow-400";
      if (rating >= 4) return "text-orange-400 fill-orange-400";
      return "text-red-400 fill-red-400";
    };

    const starColor = getStarColor(rating);

    return (
      <div className="flex items-center space-x-1">
        <Star
          className={`w-4 h-4 ${starColor} transition-all duration-300 hover:scale-110`}
        />
        <span className="text-sm text-white font-medium">{rating}/10</span>
      </div>
    );
  };

  const getProgressText = () => {
    const chaptersRead = entry.chapters_read || 0;
    const totalChapters = entry.total_chapters;

    switch (statusType) {
      case "Reading":
        return totalChapters ? `${chaptersRead}/${totalChapters}` : `${chaptersRead}/?`;
      case "Plan to Read":
        return totalChapters ? `0/${totalChapters}` : "0/?";
      case "Dropped":
        return totalChapters ? `${chaptersRead}/${totalChapters}` : `${chaptersRead} read`;
      case "Paused":
        return totalChapters ? `${chaptersRead}/${totalChapters}` : `${chaptersRead}/?`;
      case "Rereading":
        return totalChapters ? `${chaptersRead}/${totalChapters}` : `${chaptersRead}/?`;
      case "Completed":
        return totalChapters ? `${totalChapters}/${totalChapters}` : null;
      default:
        return null;
    }
  };

  const shouldShowProgress = statusType !== "Completed";
  const shouldShowScore = statusType === "Completed" || statusType === "Dropped";
  const progressText = getProgressText();

  const truncateTitle = (title: string, maxLength: number = 25) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "…";
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 group cursor-pointer hover:scale-[1.08] w-full aspect-[2/3] shadow-lg">
        <CardContent className="p-0 h-full relative">
          {/* Cover Image - Using compressed version for faster loading */}
          <div className="aspect-[2/3] relative overflow-hidden rounded-md h-full" onClick={() => setShowDetails(true)}>
            {/* SKELETON/SHIMMER */}
            {imageLoading && (
              <Skeleton className="absolute inset-0 w-full h-full z-10" />
            )}
            <img
              src={cardImageUrl}
              alt={entry.title}
              className={`w-full h-full object-cover object-center transition-transform duration-200 group-hover:scale-105 ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                setImageLoading(false);
              }}
            />

            {/* Progress Text - Top Right Corner with Glassmorphism */}
            {shouldShowProgress && progressText && (
              <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-md text-xs text-white font-medium shadow-lg">
                {progressText}
              </div>
            )}

            {/* Bottom overlay with title, author, score and actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8 z-10">
              {/* Score (left aligned) */}
              {shouldShowScore && entry.rating && (
                <div className="flex items-center mb-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-white text-xs font-medium">{entry.rating}</span>
                </div>
              )}

              {/* Title */}
              <h3 className="font-semibold text-white text-sm leading-tight mb-1">
                {truncateTitle(entry.title)}
              </h3>

              {/* Author */}
              <p className="text-gray-200 text-xs mb-3 opacity-90">
                {entry.author}
              </p>

              {/* Centered Actions */}
              {!isReadOnly && (
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(entry);
                      }}
                      className="border-white/40 text-white bg-black/70 hover:bg-black/90 hover:border-white/60 text-xs px-2 py-1 h-7 backdrop-blur-sm"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                      }}
                      className="border-red-400/60 text-red-200 bg-black/70 hover:bg-red-900/70 hover:border-red-400/80 text-xs px-2 py-1 h-7 backdrop-blur-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog - Using high-quality original image */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-left">{entry.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Cover and basic info row - Using original high-quality image */}
            <div className="flex gap-4">
              <div className="w-32 h-48 flex-shrink-0 relative">
                {detailImageLoading && (
                  <Skeleton className="absolute inset-0 w-full h-full z-10" />
                )}
                <img
                  src={detailImageUrl}
                  alt={entry.title}
                  className={`w-full h-full object-cover rounded-md ${detailImageLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                  onLoad={() => setDetailImageLoading(false)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    setDetailImageLoading(false);
                  }}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Author</p>
                  <p className="text-white font-medium">{entry.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <Badge className={`${statusColors[entry.status]} text-white`}>
                    {entry.status}
                  </Badge>
                </div>
                {entry.rating && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Rating</p>
                    {renderSingleStar(entry.rating)}
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Progress */}
            {(entry.chapters_read !== undefined || entry.total_chapters) && (
              <div>
                <p className="text-sm text-gray-400">Progress</p>
                <p className="text-white">
                  {entry.chapters_read || 0} / {entry.total_chapters || "?"} chapters
                </p>
              </div>
            )}

            {/* Dates Section */}
            {(entry.start_date || entry.end_date) && (
              <div className="grid grid-cols-2 gap-4">
                {entry.start_date && (
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="text-white">{new Date(entry.start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {entry.end_date && (
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p className="text-white">{new Date(entry.end_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}

            {entry.source && (
              <div>
                <p className="text-sm text-gray-400">Source</p>
                <p className="text-white">{entry.source}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {entry.synopsis && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Synopsis</p>
                <p className="text-white text-sm leading-relaxed">{entry.synopsis}</p>
              </div>
            )}

            {entry.notes && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Personal Notes</p>
                <p className="text-white text-sm leading-relaxed">{entry.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete "{entry.title}"? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-gray-600 text-gray-900 bg-gray-300 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(entry.id);
                  setShowDeleteConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
