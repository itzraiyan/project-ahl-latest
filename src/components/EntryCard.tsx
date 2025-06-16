
import { useState } from "react";
import { Star, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Entry } from "@/pages/Index";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  isReadOnly: boolean;
}

const statusColors: Record<string, string> = {
  "Plan to Read": "bg-gray-500",
  "Reading": "bg-blue-500",
  "Paused": "bg-yellow-500",
  "Completed": "bg-green-500",
  "Dropped": "bg-red-500",
  "Rereading": "bg-purple-500"
};

export const EntryCard = ({ entry, onEdit, onDelete, isReadOnly }: EntryCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-400 ml-1">{rating}/10</span>
      </div>
    );
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group">
        <CardContent className="p-4">
          {/* Cover Image */}
          <div className="aspect-[3/4] mb-3 relative overflow-hidden rounded-md bg-gray-700">
            <img
              src={entry.coverUrl}
              alt={entry.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={`${statusColors[entry.status]} text-white text-xs mb-2`}>
            {entry.status}
          </Badge>

          {/* Title */}
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 leading-tight">
            {entry.title}
          </h3>

          {/* Author */}
          <p className="text-gray-400 text-xs mb-2">{entry.author}</p>

          {/* Rating */}
          {entry.rating && renderStars(entry.rating)}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2 mb-3">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                {tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                +{entry.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(entry)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-600 text-red-400 hover:bg-red-900"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
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
            {entry.releaseDate && (
              <div>
                <p className="text-sm text-gray-400">Release Date</p>
                <p className="text-white">{new Date(entry.releaseDate).toLocaleDateString()}</p>
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
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(entry.id);
                  setShowDeleteConfirm(false);
                }}
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
