import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Entry } from "@/hooks/useEntries";

interface EntryFormProps {
  entry?: Entry;
  onSubmit: (entry: Entry | Omit<Entry, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const sources = [
  { name: "Nhentai.net", url: "https://nhentai.net/" },
  { name: "Hentaifox.com", url: "https://hentaifox.com/" },
  { name: "Hentai2read.com", url: "https://hentai2read.com/" },
  { name: "Hitomi.la", url: "https://hitomi.la/" },
  { name: "Hentairead.com", url: "https://hentairead.com/" },
  { name: "Hentaiera.com", url: "https://hentaiera.com/" },
  { name: "Imhentai.xxx", url: "https://imhentai.xxx/" },
  { name: "Hentaihand.com", url: "https://hentaihand.com/" }
];

export const EntryForm = ({ entry, onSubmit, onCancel }: EntryFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    cover_url: "",
    tags: [] as string[],
    status: "Plan to Read" as Entry["status"],
    rating: 5.5 as number | undefined,
    notes: "",
    release_date: "",
    synopsis: "",
    source: "",
    source_url: "",
    total_chapters: undefined as number | undefined,
    chapters_read: 0 as number,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined
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
        rating: entry.rating || 5.5,
        notes: entry.notes || "",
        release_date: entry.release_date || "",
        synopsis: entry.synopsis || "",
        source: entry.source || "",
        source_url: "",
        total_chapters: entry.total_chapters || undefined,
        chapters_read: entry.chapters_read || 0,
        start_date: entry.start_date ? new Date(entry.start_date) : undefined,
        end_date: entry.end_date ? new Date(entry.end_date) : undefined
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

  const handleRatingChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, rating: value[0] }));
  };

  const handleChaptersReadChange = (increment: boolean) => {
    setFormData(prev => {
      const newValue = increment 
        ? prev.chapters_read + 1 
        : Math.max(0, prev.chapters_read - 1);
      return { ...prev, chapters_read: newValue };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    if (!formData.title.trim() || !formData.author.trim()) {
      console.log("Missing required fields");
      return;
    }

    // Use source_url if provided, otherwise use the selected source
    const finalSource = formData.source_url.trim() || formData.source;

    // If total_chapters is empty but chapters_read has a value, set total_chapters to chapters_read
    const finalTotalChapters = formData.total_chapters || (formData.chapters_read > 0 ? formData.chapters_read : undefined);

    const submitData = {
      title: formData.title,
      author: formData.author,
      cover_url: formData.cover_url,
      tags: formData.tags,
      status: formData.status,
      rating: formData.rating,
      notes: formData.notes,
      release_date: formData.release_date,
      synopsis: formData.synopsis,
      source: finalSource,
      total_chapters: finalTotalChapters,
      chapters_read: formData.chapters_read,
      start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : undefined,
      end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined
    };

    if (entry) {
      onSubmit({
        ...entry,
        ...submitData
      });
    } else {
      onSubmit(submitData);
    }
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
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
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
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cover_url" className="text-white">Cover Image URL</Label>
        <Input
          id="cover_url"
          value={formData.cover_url}
          onChange={(e) => setFormData(prev => ({ ...prev, cover_url: e.target.value }))}
          placeholder="https://example.com/cover.jpg"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select value={formData.status} onValueChange={(value: Entry["status"]) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="Plan to Read" className="text-white">Plan to Read</SelectItem>
              <SelectItem value="Reading" className="text-white">Reading</SelectItem>
              <SelectItem value="Paused" className="text-white">Paused</SelectItem>
              <SelectItem value="Completed" className="text-white">Completed</SelectItem>
              <SelectItem value="Dropped" className="text-white">Dropped</SelectItem>
              <SelectItem value="Rereading" className="text-white">Rereading</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="release_date" className="text-white">Release Date</Label>
          <Input
            id="release_date"
            type="date"
            value={formData.release_date}
            onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            style={{
              colorScheme: 'dark'
            }}
          />
        </div>
      </div>

      {/* Chapter Tracking Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_chapters" className="text-white">Total Chapters</Label>
          <Input
            id="total_chapters"
            type="number"
            value={formData.total_chapters || ""}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              total_chapters: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            placeholder="Leave empty to auto-set"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="chapters_read" className="text-white">Chapters Read</Label>
          <div className="flex">
            <Input
              id="chapters_read"
              type="number"
              value={formData.chapters_read}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                chapters_read: Math.max(0, parseInt(e.target.value) || 0)
              }))}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-r-none"
              min="0"
            />
            <div className="flex flex-col border-l-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleChaptersReadChange(true)}
                className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 rounded-none rounded-tr-md px-2 py-1 h-5"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleChaptersReadChange(false)}
                className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 rounded-none rounded-br-md px-2 py-1 h-5 border-t-0"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Start Date and End Date Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                  !formData.start_date && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? format(formData.start_date, "dd/MM/yyyy") : "DD/MM/YYYY"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="text-white">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                  !formData.end_date && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? format(formData.end_date, "dd/MM/yyyy") : "DD/MM/YYYY"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Keep existing source section */}
      <div>
        <Label htmlFor="source" className="text-white">Source</Label>
        <div className="space-y-2">
          <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select source..." className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {sources.map((source) => (
                <SelectItem key={source.name} value={source.name} className="text-white">
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Or paste custom source URL here (overrides dropdown selection)..."
            value={formData.source_url}
            onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Keep existing rating section */}
      <div>
        <Label className="text-white">Rating: {formData.rating ? `${formData.rating}/10` : 'Not rated'}</Label>
        <div className="mt-2 space-y-2">
          <Slider
            value={formData.rating ? [formData.rating] : [5.5]}
            onValueChange={handleRatingChange}
            max={10}
            min={1}
            step={0.5}
            className="w-full [&>.relative]:bg-gray-700 [&>.relative>.absolute]:bg-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>5.5</span>
            <span>10</span>
          </div>
          {formData.rating && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, rating: undefined }))}
              className="text-xs border-gray-600 text-black bg-gray-300 hover:bg-gray-200"
            >
              Clear Rating
            </Button>
          )}
        </div>
      </div>

      {/* Keep existing tags, synopsis, and notes sections */}
      <div>
        <Label className="text-white">Tags</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddTag} 
              variant="outline" 
              className="border-gray-600 text-black bg-gray-300 hover:bg-gray-200"
            >
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
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-white">Personal Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Your thoughts, comments..."
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 min-h-[80px]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="border-gray-600 text-black bg-gray-300 hover:bg-gray-200"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
          {entry ? "Update Entry" : "Add Entry"}
        </Button>
      </div>
    </form>
  );
};
