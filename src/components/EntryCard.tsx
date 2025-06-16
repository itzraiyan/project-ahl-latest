
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
    return (
      <div className="flex items-center space-x-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-2 h-2 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">{rating}/10</span>
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
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 group cursor-pointer hover:scale-[1.02] w-full aspect-[2/3] shadow-lg">
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
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm px-3 py-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>

            {/* Bottom overlay with title and info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6">
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
              <p className="text-gray-300 text-xs mt-1 opacity-80">
                {entry.author}
              </p>

              {/* Actions */}
              {!isReadOnly && (
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="flex-1 border-gray-600 text-white bg-black/50 hover:bg-black/70 text-xs px-2 py-1 h-7"
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
                    className="border-red-600 text-red-400 bg-black/50 hover:bg-red-900/50 px-2 py-1 h-7"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{entry.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Author</p>
              <p className="text-white">{entry.author}</p>
            </div>
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
              <p className="text-sm text-gray-400">Status</p>
              <Badge className={`${statusColors[entry.status]} text-white`}>
                {entry.status}
              </Badge>
            </div>
            {entry.rating && (
              <div>
                <p className="text-sm text-gray-400">Rating</p>
                {renderStars(entry.rating)}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400">Tags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {entry.synopsis && (
              <div>
                <p className="text-sm text-gray-400">Synopsis</p>
                <p className="text-white text-sm">{entry.synopsis}</p>
              </div>
            )}
            {entry.notes && (
              <div>
                <p className="text-sm text-gray-400">Personal Notes</p>
                <p className="text-white text-sm">{entry.notes}</p>
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
