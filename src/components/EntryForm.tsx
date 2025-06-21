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
import { X, Calendar as CalendarIcon, ChevronUp, ChevronDown, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { MultiSourceInput } from "@/components/MultiSourceInput";
import type { Entry } from "@/hooks/useEntries";

interface EntryFormProps {
  entry?: Entry;
  onSubmit: (entry: Entry | Omit<Entry, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

export const EntryForm = ({ entry, onSubmit, onCancel }: EntryFormProps) => {
  const { processImage, isProcessing } = useImageProcessor();
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    cover_url: "",
    compressed_image_url: "",
    original_image_url: "",
    tags: [] as string[],
    status: "Plan to Read" as Entry["status"],
    rating: undefined as number | undefined,
    notes: "",
    synopsis: "",
    sources: [] as string[],
    total_chapters: undefined as number | undefined,
    chapters_read: 0 as number,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    total_repeats: 0 as number
  });
  const [newTag, setNewTag] = useState("");
  const [bulkTags, setBulkTags] = useState("");
  const [hasRatingInteraction, setHasRatingInteraction] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        author: entry.author,
        cover_url: entry.cover_url,
        compressed_image_url: entry.compressed_image_url || "",
        original_image_url: entry.original_image_url || "",
        tags: [...entry.tags],
        status: entry.status,
        rating: entry.rating,
        notes: entry.notes || "",
        synopsis: entry.synopsis || "",
        sources: entry.sources || [],
        total_chapters: entry.total_chapters || undefined,
        chapters_read: entry.chapters_read || 0,
        start_date: entry.start_date ? new Date(entry.start_date) : undefined,
        end_date: entry.end_date ? new Date(entry.end_date) : undefined,
        total_repeats: entry.total_repeats || 0
      });
      setHasRatingInteraction(!!entry.rating);
    }
  }, [entry]);

  const cleanAuthorName = (authorName: string) => {
    return authorName.replace(/\d+[kK]?/g, '').trim();
  };

  const parseBulkTags = (bulkText: string) => {
    if (!bulkText.trim()) return [];
    const tags = bulkText
      .split(/\n|\r\n|\r/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !/^[\d,kK\s]+$/.test(line))
      .map(line => line.replace(/[\d,kK]+/g, '').trim())
      .filter(line => line.length > 0)
      .map(line => line.toLowerCase());
    return [...new Set(tags)];
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag("");
    }
  };

  const handleBulkTagsAdd = () => {
    const newTags = parseBulkTags(bulkTags);
    const uniqueNewTags = newTags.filter(tag => !formData.tags.includes(tag));
    if (uniqueNewTags.length > 0) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, ...uniqueNewTags]
      }));
    }
    setBulkTags("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRatingChange = (value: number[]) => {
    setHasRatingInteraction(true);
    setFormData(prev => ({ ...prev, rating: value[0] }));
  };

  const handleClearRating = () => {
    setHasRatingInteraction(false);
    setFormData(prev => ({ ...prev, rating: undefined }));
  };

  const handleChaptersReadChange = (increment: boolean) => {
    setFormData(prev => {
      const newValue = increment 
        ? prev.chapters_read + 1 
        : Math.max(0, prev.chapters_read - 1);
      return { ...prev, chapters_read: newValue };
    });
  };

  const handleAuthorChange = (value: string) => {
    const cleanedAuthor = cleanAuthorName(value);
    setFormData(prev => ({ ...prev, author: cleanedAuthor }));
  };

  const handleProcessImage = async () => {
    if (!formData.cover_url || !formData.title) {
      setProcessingStatus("❌ Cover URL and title are required");
      return;
    }
    
    setProcessingStatus("🔄 Processing image...");
    const result = await processImage(formData.cover_url, formData.title);
    
    if (result) {
      setFormData(prev => ({
        ...prev,
        compressed_image_url: result.compressedUrl,
        original_image_url: result.originalUrl
      }));
      setProcessingStatus("✅ Image processed and uploaded successfully!");
    } else {
      setProcessingStatus("❌ Failed to process image. Check console for details.");
    }
  };

  const handleStatusChange = (newStatus: Entry["status"]) => {
    setFormData(prev => {
      const updates: Partial<typeof prev> = { status: newStatus };
      
      // Auto date detection logic based on status
      if (newStatus === "Reading" && !prev.start_date) {
        updates.start_date = new Date();
      }
      
      if (newStatus === "Completed" && !prev.end_date) {
        updates.end_date = new Date();
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setFormData(prev => {
      const updates: Partial<typeof prev> = { start_date: date };
      
      // If adding start date and status is Plan to Read, auto-convert to Reading
      if (date && prev.status === "Plan to Read") {
        updates.status = "Reading";
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setFormData(prev => {
      const updates: Partial<typeof prev> = { end_date: date };
      
      // If adding end date, auto-convert to Completed (unless already completed)
      if (date && prev.status !== "Completed") {
        updates.status = "Completed";
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      console.log("Missing required fields");
      return;
    }
    
    const finalTotalChapters = formData.total_chapters || (formData.chapters_read > 0 ? formData.chapters_read : undefined);
    const submitData = {
      title: formData.title,
      author: formData.author,
      cover_url: formData.cover_url,
      compressed_image_url: formData.compressed_image_url || undefined,
      original_image_url: formData.original_image_url || undefined,
      tags: formData.tags,
      status: formData.status,
      rating: hasRatingInteraction ? formData.rating : undefined,
      notes: formData.notes,
      synopsis: formData.synopsis,
      sources: formData.sources,
      total_chapters: finalTotalChapters,
      chapters_read: formData.chapters_read,
      start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : undefined,
      end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined,
      total_repeats: formData.total_repeats
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

  // Always show "Process & Upload Image" button, but disable it unless title & cover_url are provided
  const canProcessImage = !!(formData.title && formData.cover_url);

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
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="author" className="text-white">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => handleAuthorChange(e.target.value)}
            placeholder="Enter author name..."
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cover_url" className="text-white">Cover Image URL</Label>
        <div className="space-y-2">
          <Input
            id="cover_url"
            value={formData.cover_url}
            onChange={(e) => setFormData(prev => ({ ...prev, cover_url: e.target.value }))}
            placeholder="https://example.com/cover.jpg"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white"
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleProcessImage}
            disabled={!canProcessImage || isProcessing}
            className={`
              bg-primary border-primary !text-white
              hover:bg-primary-600 hover:border-primary-600 transition-colors duration-200 
              flex items-center gap-2
              ${(!canProcessImage || isProcessing) ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? "Processing..." : "Process & Upload Image"}
          </Button>
          
          {processingStatus && (
            <p className={`text-sm ${
              processingStatus.includes('✅') ? 'text-green-400' : 
              processingStatus.includes('❌') ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {processingStatus}
            </p>
          )}
          
          {formData.compressed_image_url && (
            <div className="text-sm space-y-1">
              <p className="text-green-400">✓ Compressed: {formData.compressed_image_url}</p>
              <p className="text-green-400">✓ Original: {formData.original_image_url}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="status" className="text-white">Status</Label>
        <Select value={formData.status} onValueChange={handleStatusChange}>
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
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white"
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
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white rounded-r-none"
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
                onSelect={handleStartDateChange}
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
                onSelect={handleEndDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Multi-source input */}
      <MultiSourceInput
        sources={formData.sources}
        onChange={(sources) => setFormData(prev => ({ ...prev, sources }))}
      />

      <div>
        <Label className="text-white">
          Rating: {hasRatingInteraction && formData.rating ? `${formData.rating}/10` : 'Not rated'}
        </Label>
        <div className="mt-2 space-y-2">
          <Slider
            value={hasRatingInteraction && formData.rating ? [formData.rating] : [5.5]}
            onValueChange={handleRatingChange}
            max={10}
            min={1}
            step={0.5}
            className="w-full [&>.relative]:bg-gray-700 [&>.relative>.absolute]:bg-primary"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>5.5</span>
            <span>10</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearRating}
            className="text-xs bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-600"
          >
            Clear Rating
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-white">Tags</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a single tag..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white"
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
              className="bg-primary border-primary text-primary-foreground hover:bg-primary-600 hover:border-primary-600 transition-colors duration-200"
            >
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            <Textarea
              value={bulkTags}
              onChange={(e) => setBulkTags(e.target.value)}
              placeholder="Or paste multiple tags (one per line)...\n\nExample:\nbig breasts\n185K\nsole female\n160K\nnakadashi"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white min-h-[100px]"
            />
            <Button 
              type="button" 
              onClick={handleBulkTagsAdd} 
              variant="outline" 
              className="bg-primary border-primary text-primary-foreground hover:bg-primary-600 hover:border-primary-600 transition-colors duration-200"
              disabled={!bulkTags.trim()}
            >
              Parse & Add Tags
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-primary text-primary-foreground">
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
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-white">Personal Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Your thoughts, comments..."
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white min-h-[80px]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-600"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary-600 text-primary-foreground transition-colors duration-200">
          {entry ? "Update Entry" : "Add Entry"}
        </Button>
      </div>
    </form>
  );
};
