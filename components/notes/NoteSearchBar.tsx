import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface NoteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const NoteSearchBar = React.memo(function NoteSearchBar({
  value,
  onChange,
}: NoteSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 h-9"
      />
    </div>
  );
});
