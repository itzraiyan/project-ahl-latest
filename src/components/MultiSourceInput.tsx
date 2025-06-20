
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MultiSourceInputProps {
  sources: string[];
  onChange: (sources: string[]) => void;
}

export const MultiSourceInput = ({ sources, onChange }: MultiSourceInputProps) => {
  const [localSources, setLocalSources] = useState<string[]>(sources.length > 0 ? sources : [""]);

  const addSource = () => {
    const newSources = [...localSources, ""];
    setLocalSources(newSources);
    onChange(newSources.filter(s => s.trim() !== ""));
  };

  const removeSource = (index: number) => {
    const newSources = localSources.filter((_, i) => i !== index);
    setLocalSources(newSources.length > 0 ? newSources : [""]);
    onChange(newSources.filter(s => s.trim() !== ""));
  };

  const updateSource = (index: number, value: string) => {
    const newSources = [...localSources];
    newSources[index] = value;
    setLocalSources(newSources);
    onChange(newSources.filter(s => s.trim() !== ""));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="sources" className="text-white">Sources</Label>
      {localSources.map((source, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={source}
            onChange={(e) => updateSource(index, e.target.value)}
            placeholder="Enter source URL"
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:text-white"
          />
          {localSources.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeSource(index)}
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 focus:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {index === localSources.length - 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSource}
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 focus:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
