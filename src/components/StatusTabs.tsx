
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  statusCounts: Record<string, number>;
  children: React.ReactNode;
}

const statusMap = {
  "reading": "Reading",
  "planning": "Plan to Read", 
  "completed": "Completed",
  "paused": "Paused",
  "dropped": "Dropped",
  "rereading": "Rereading"
};

export const StatusTabs = ({ activeTab, onTabChange, statusCounts, children }: StatusTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-gray-800 border-gray-700 w-full justify-start h-auto p-1">
        {Object.entries(statusMap).map(([key, status]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300 hover:text-white flex items-center gap-2 px-4 py-2"
          >
            {status}
            <Badge variant="secondary" className="bg-gray-700 text-gray-200 text-xs">
              {statusCounts[status] || 0}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};
