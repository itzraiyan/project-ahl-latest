import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EntryForm } from "@/components/EntryForm";
import { AuthButton } from "@/components/AuthButton";
import { SectionHeader } from "@/components/SectionHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { AniListButton } from "@/components/AniListButton";
import { PaginatedSection } from "@/components/PaginatedSection";
import { Footer } from "@/components/Footer";
import { useEntries, type Entry } from "@/hooks/useEntries";
import { getAuthStatus } from "@/utils/authUtils";
import logo from '../assets/logo.svg';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  
  const { entries, isLoading, addEntry, updateEntry, deleteEntry } = useEntries();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = getAuthStatus();
      console.log("Auth status:", isAuthenticated);
      setUser(isAuthenticated ? { name: "Raiyan" } : null);
    };
    
    checkAuth();
  }, []);

  const handleAuthChange = () => {
    const isAuthenticated = getAuthStatus();
    console.log("Auth changed:", isAuthenticated);
    setUser(isAuthenticated ? { name: "Raiyan" } : null);
  };

  const statuses = [
    { key: "Reading", title: "Reading", color: "bg-[#00FFFF]" },
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

  const handleAddEntry = async (entry: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    console.log("Adding entry:", entry);
    try {
      await addEntry(entry);
      setIsAddingEntry(false);
    } catch (error) {
      console.error("Failed to add entry:", error);
    }
  };

  const handleEditEntry = async (updatedEntry: Entry) => {
    console.log("Updating entry:", updatedEntry);
    try {
      await updateEntry(updatedEntry);
      setEditingEntry(null);
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
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
            <img src={logo} alt="Logo" className="h-8" />
            <div className="flex items-center space-x-4">
              <AniListButton />
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
                  <Button style={{ backgroundColor: "#00FFFF" }} className="hover:bg-cyan-600 text-black">
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

        {/* Dashboard Stats */}
        <DashboardStats entries={entries} />

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
                  <PaginatedSection
                    entries={sectionEntries}
                    onEdit={setEditingEntry}
                    onDelete={deleteEntry}
                    isReadOnly={!user}
                    statusType={status.key as any}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No entries in this section.</p>
                    {user && (
                      <Button 
                        style={{ backgroundColor: "#00FFFF" }}
                        className="mt-4 hover:bg-cyan-600 text-black"
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

      {/* Footer */}
      <Footer />

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
