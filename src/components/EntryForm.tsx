
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Star } from "lucide-react";
import type { Entry } from "@/hooks/useEntries";

interface EntryFormProps {
  entry?: Entry;
  onSubmit: (entry: Entry | Omit<Entry, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

export const EntryForm = ({ entry, onSubmit, onCancel }: EntryFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    cover_url: "",
    tags: [] as string[],
    status: "Plan to Read" as Entry["status"],
    rating: undefined as number | undefined,
    notes: "",
    release_date: "",
    synopsis: "",
    source: ""
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        author: entry.author,
        cover_url: entry.cover_url,
        tags: [...entry.tags],
        status: entry.status,
        rating: entry.rating,
        notes: entry.notes || "",
        release_date: entry.release_date || "",
        synopsis: entry.synopsis || "",
        source: entry.source || ""
      });
    }
  }, [entry]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) return;

    if (entry) {
      onSubmit({
        ...entry,
        ...formData
      });
    } else {
      onSubmit(formData);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(10)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
            className="focus:outline-none"
          >
            <Star
              className={`w-4 h-4 ${
                formData.rating && i < formData.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-600 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
        {formData.rating && (
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: undefined }))}
            className="text-sm text-gray-400 ml-2 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-white">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter title..."
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="author" className="text-white">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            placeholder="Enter author name..."
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="coverUrl" className="text-white">Cover Image URL</Label>
        <Input
          id="coverUrl"
          value={formData.coverUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
          placeholder="https://example.com/cover.jpg"
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select value={formData.status} onValueChange={(value: Entry["status"]) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Plan to Read">Plan to Read</SelectItem>
              <SelectItem value="Reading">Reading</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
              <SelectItem value="Rereading">Rereading</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="releaseDate" className="text-white">Release Date</Label>
          <Input
            id="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div>
          <Label htmlFor="source" className="text-white">Source</Label>
          <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select source..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="nhentai">nhentai</SelectItem>
              <SelectItem value="DLsite">DLsite</SelectItem>
              <SelectItem value="Pixiv">Pixiv</SelectItem>
              <SelectItem value="DMM">DMM</SelectItem>
              <SelectItem value="Melonbooks">Melonbooks</SelectItem>
              <SelectItem value="Suruga-ya">Suruga-ya</SelectItem>
              <SelectItem value="Amazon Japan">Amazon Japan</SelectItem>
              <SelectItem value="Manual">Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-white">Rating</Label>
        <div className="mt-2">
          {renderStarRating()}
          {formData.rating && (
            <p className="text-sm text-gray-400 mt-1">{formData.rating}/10</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-white">Tags</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" onClick={handleAddTag} variant="outline" className="border-gray-600">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-purple-600 text-white">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="synopsis" className="text-white">Synopsis</Label>
        <Textarea
          id="synopsis"
          value={formData.synopsis}
          onChange={(e) => setFormData(prev => ({ ...prev, synopsis: e.target.value }))}
          placeholder="Enter synopsis..."
          className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-white">Personal Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Your thoughts, comments..."
          className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          {entry ? "Update Entry" : "Add Entry"}
        </Button>
      </div>
    </form>
  );
};
