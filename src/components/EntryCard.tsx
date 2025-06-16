
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

  const getDisplayContent = () => {
    switch (statusType) {
      case "Reading":
        return {
          showProgress: true,
          showScore: false,
          progressText: "1/?"
        };
      case "Plan to Read":
        return {
          showProgress: true,
          showScore: false,
          progressText: "0/?"
        };
      case "Dropped":
        return {
          showProgress: true,
          showScore: false,
          progressText: "1 read"
        };
      case "Completed":
        return {
          showProgress: false,
          showScore: true,
          progressText: null
        };
      default:
        return {
          showProgress: true,
          showScore: false,
          progressText: "1/?"
        };
    }
  };

  const displayContent = getDisplayContent();

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 group cursor-pointer hover:scale-[1.02] w-full">
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="aspect-[2/3] relative overflow-hidden rounded-t-md bg-gray-700" onClick={() => setShowDetails(true)}>
            <img
              src={entry.cover_url}
              alt={entry.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm px-2 py-1"
              >
                <Eye className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Progress Badge */}
            {displayContent.showProgress && displayContent.progressText && (
              <div className="absolute top-1 right-1">
                <Badge className="bg-black bg-opacity-70 text-white text-[10px] px-1 py-0">
                  {displayContent.progressText}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-2">
            {/* Title */}
            <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2 leading-tight min-h-[2rem]">
              {entry.title}
            </h3>

            {/* Author */}
            <p className="text-gray-400 text-[10px] mb-2">{entry.author}</p>

            {/* Rating or Progress */}
            <div className="mb-2 min-h-[0.75rem]">
              {displayContent.showScore && entry.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">{entry.rating}/10</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 text-[10px] px-1 py-1 h-6"
                >
                  <Edit className="w-2 h-2 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="border-red-600 text-red-400 hover:bg-red-900 px-1 py-1 h-6"
                >
                  <Trash2 className="w-2 h-2" />
                </Button>
              </div>
            )}
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
                className="border-gray-600 text-black bg-gray-300 hover:bg-gray-200"
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
