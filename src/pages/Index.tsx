
import { useState, useEffect } from "react";
import { Search, Plus, Filter, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EntryCard } from "@/components/EntryCard";
import { EntryForm } from "@/components/EntryForm";
import { LoginForm } from "@/components/LoginForm";
import { Badge } from "@/components/ui/badge";

export interface Entry {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  tags: string[];
  status: "Plan to Read" | "Reading" | "Paused" | "Completed" | "Dropped" | "Rereading";
  rating?: number;
  notes?: string;
  releaseDate?: string;
  synopsis?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  "Plan to Read": "bg-gray-500",
  "Reading": "bg-blue-500",
  "Paused": "bg-yellow-500",
  "Completed": "bg-green-500",
  "Dropped": "bg-red-500",
  "Rereading": "bg-purple-500"
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Sample data for demonstration
  useEffect(() => {
    const sampleEntries: Entry[] = [
      {
        id: "1",
        title: "Sample Doujinshi #1",
        author: "Artist Name",
        coverUrl: "/placeholder.svg",
        tags: ["romance", "comedy", "slice of life"],
        status: "Completed",
        rating: 8,
        notes: "Really enjoyed this one!",
        releaseDate: "2024-01-15",
        synopsis: "A heartwarming story about...",
        source: "nhentai",
        createdAt: "2024-01-20",
        updatedAt: "2024-01-20"
      },
      {
        id: "2",
        title: "Another Great Work",
        author: "Another Artist",
        coverUrl: "/placeholder.svg",
        tags: ["drama", "supernatural"],
        status: "Reading",
        rating: 7,
        releaseDate: "2024-02-01",
        source: "DLsite",
        createdAt: "2024-02-05",
        updatedAt: "2024-02-05"
      },
      {
        id: "3",
        title: "Plan to Read This",
        author: "Future Author",
        coverUrl: "/placeholder.svg",
        tags: ["action", "adventure"],
        status: "Plan to Read",
        releaseDate: "2024-03-01",
        source: "Pixiv",
        createdAt: "2024-02-10",
        updatedAt: "2024-02-10"
      }
    ];
    setEntries(sampleEntries);
  }, []);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    const matchesTag = !tagFilter || entry.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  const handleAddEntry = (entry: Omit<Entry, "id" | "createdAt" | "updatedAt">) => {
    const newEntry: Entry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEntries(prev => [newEntry, ...prev]);
    setIsAddingEntry(false);
  };

  const handleEditEntry = (updatedEntry: Entry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id 
        ? { ...updatedEntry, updatedAt: new Date().toISOString() }
        : entry
    ));
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getAllTags = () => {
    const allTags = entries.flatMap(entry => entry.tags);
    return [...new Set(allTags)].sort();
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      counts[entry.status] = (counts[entry.status] || 0) + 1;
    });
    return counts;
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Personal Archive
              </h1>
              <div className="flex space-x-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <Badge key={status} variant="secondary" className={`${statusColors[status]} text-white`}>
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoggedIn(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Plan to Read">Plan to Read</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                  <SelectItem value="Rereading">Rereading</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-40 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Entry</DialogTitle>
                  </DialogHeader>
                  <EntryForm
                    onSubmit={handleAddEntry}
                    onCancel={() => setIsAddingEntry(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={setEditingEntry}
              onDelete={handleDeleteEntry}
              isReadOnly={false}
            />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No entries found matching your criteria.</p>
            <Button 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsAddingEntry(true)}
            >
              Add Your First Entry
            </Button>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
            </DialogHeader>
            <EntryForm
              entry={editingEntry}
              onSubmit={handleEditEntry}
              onCancel={() => setEditingEntry(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
