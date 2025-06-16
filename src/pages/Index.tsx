
import { useState, useEffect } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EntryCard } from "@/components/EntryCard";
import { EntryForm } from "@/components/EntryForm";
import { AuthButton } from "@/components/AuthButton";
import { StatusTabs } from "@/components/StatusTabs";
import { useEntries, type Entry } from "@/hooks/useEntries";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("reading");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  
  const { entries, isLoading, addEntry, updateEntry, deleteEntry } = useEntries();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("rhl_auth");
      setUser(authStatus === "authenticated" ? { name: "Raiyan" } : null);
    };
    
    checkAuth();
  }, []);

  const handleAuthChange = () => {
    const authStatus = localStorage.getItem("rhl_auth");
    setUser(authStatus === "authenticated" ? { name: "Raiyan" } : null);
  };

  const statusMap: Record<string, string> = {
    "reading": "Reading",
    "planning": "Plan to Read", 
    "completed": "Completed",
    "paused": "Paused",
    "dropped": "Dropped",
    "rereading": "Rereading"
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = entry.status === statusMap[activeTab];
    
    return matchesSearch && matchesStatus;
  });

  const handleAddEntry = (entry: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    addEntry(entry);
    setIsAddingEntry(false);
  };

  const handleEditEntry = (updatedEntry: Entry) => {
    updateEntry(updatedEntry);
    setEditingEntry(null);
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      counts[entry.status] = (counts[entry.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-400">
              RHL
            </h1>
            <div className="flex items-center space-x-4">
              <AuthButton user={user} onAuthChange={handleAuthChange} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and Add Entry */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            {user && (
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
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
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          statusCounts={statusCounts}
        >
          {/* Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={setEditingEntry}
                onDelete={deleteEntry}
                isReadOnly={!user}
              />
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No entries found in this category.</p>
              {user && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsAddingEntry(true)}
                >
                  Add Your First Entry
                </Button>
              )}
            </div>
          )}
        </StatusTabs>
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
