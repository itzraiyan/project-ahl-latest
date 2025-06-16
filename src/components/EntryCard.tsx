
import { useState } from "react";
import { Star, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const renderStars = (rating?: number) => {
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
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? starColor : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-300 ml-2 font-medium">{rating}/10</span>
      </div>
    );
  };

  const getProgressText = () => {
    switch (statusType) {
      case "Reading":
        return "1/?";
      case "Plan to Read":
        return "0/?";
      case "Dropped":
        return "1 read";
      case "Paused":
        return "1/?";
      case "Rereading":
        return "1/?";
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
          {/* Cover Image */}
          <div className="aspect-[2/3] relative overflow-hidden rounded-md bg-gray-700 h-full" onClick={() => setShowDetails(true)}>
            <img
              src={entry.cover_url}
              alt={entry.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            
            {/* Hover overlay - lighter transparency */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm px-3 py-1 bg-white/90 text-black hover:bg-white"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>

            {/* Bottom overlay with title and info - lighter gradient */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 pt-6">
              {/* Score and Progress on the same line */}
              <div className="flex justify-between items-center mb-2">
                {/* Score (left) */}
                <div className="text-white text-xs">
                  {shouldShowScore && entry.rating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{entry.rating}</span>
                    </div>
                  )}
                </div>
                
                {/* Progress (right) */}
                <div className="text-white text-xs">
                  {shouldShowProgress && progressText && (
                    <span className="bg-black/50 px-2 py-1 rounded text-xs">
                      {progressText}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white text-sm leading-tight">
                {truncateTitle(entry.title)}
              </h3>

              {/* Author */}
              <p className="text-gray-200 text-xs mt-1 opacity-90">
                {entry.author}
              </p>

              {/* Actions - More visible */}
              {!isReadOnly && (
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="flex-1 border-white/30 text-white bg-black/60 hover:bg-black/80 hover:border-white/50 text-xs px-2 py-1 h-7"
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
                    className="border-red-400/50 text-red-300 bg-black/60 hover:bg-red-900/60 hover:border-red-400 px-2 py-1 h-7"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog - Enhanced with full information */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-left">{entry.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Cover and basic info row */}
            <div className="flex gap-4">
              <div className="w-32 h-48 flex-shrink-0">
                <img
                  src={entry.cover_url}
                  alt={entry.title}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
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
                    {renderStars(entry.rating)}
                  </div>
                )}
              </div>
            </div>

            {/* Additional details */}
            {entry.release_date && (
              <div>
                <p className="text-sm text-gray-400">Release Date</p>
                <p className="text-white">{new Date(entry.release_date).toLocaleDateString()}</p>
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
