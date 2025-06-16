
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EntryCard } from "@/components/EntryCard";
import { EntryForm } from "@/components/EntryForm";
import { AuthButton } from "@/components/AuthButton";
import { SectionHeader } from "@/components/SectionHeader";
import { useEntries, type Entry } from "@/hooks/useEntries";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  
  const { entries, isLoading, addEntry, updateEntry, deleteEntry } = useEntries();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("rhl_auth");
      setUser(authStatus === "authenticated" ? { name: "Arefin" } : null);
    };
    
    checkAuth();
  }, []);

  const handleAuthChange = () => {
    const authStatus = localStorage.getItem("rhl_auth");
    setUser(authStatus === "authenticated" ? { name: "Arefin" } : null);
  };

  const statuses = [
    { key: "Reading", title: "Reading", color: "bg-blue-500" },
    { key: "Completed", title: "Completed", color: "bg-green-500" },
    { key: "Dropped", title: "Dropped", color: "bg-red-500" },
    { key: "Plan to Read", title: "Plan to Read", color: "bg-gray-500" },
    { key: "Paused", title: "Paused", color: "bg-yellow-500" },
    { key: "Rereading", title: "Rereading", color: "bg-purple-500" }
  ];

  const getFilteredEntries = (status: string) => {
    const filtered = entries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = entry.status === status;
      
      return matchesSearch && matchesStatus;
    });

    // Apply sorting based on status
    if (status === "Completed") {
      return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const handleAddEntry = (entry: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    addEntry(entry);
    setIsAddingEntry(false);
  };

  const handleEditEntry = (updatedEntry: Entry) => {
    updateEntry(updatedEntry);
    setEditingEntry(null);
  };

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
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-400">
              AHL
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
        <div className="mb-8 space-y-4">
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

        {/* Sections */}
        <div className="space-y-12">
          {statuses.map((status) => {
            const sectionEntries = getFilteredEntries(status.key);
            
            // Only show sections that have entries or when user is logged in
            if (sectionEntries.length === 0 && !user) return null;
            
            return (
              <section key={status.key} className="space-y-6">
                <SectionHeader 
                  title={status.title}
                  count={sectionEntries.length}
                  color={status.color}
                />
                
                {sectionEntries.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {sectionEntries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={setEditingEntry}
                        onDelete={deleteEntry}
                        isReadOnly={!user}
                        statusType={status.key as any}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No entries in this section.</p>
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
              </section>
            );
          })}
        </div>
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
