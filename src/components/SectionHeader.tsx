
import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  title: string;
  count: number;
  color: string;
}

export const SectionHeader = ({ title, count, color }: SectionHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-8 bg-primary rounded-full" />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <Badge variant="secondary" className="bg-gray-800 text-gray-200 text-sm px-3 py-1">
        {count}
      </Badge>
    </div>
  );
};
