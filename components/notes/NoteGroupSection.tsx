import React from "react";
import { Separator } from "@/components/ui/separator";
import { NoteListItem } from "./NoteListItem";
import { NoteMetadata } from "@/hooks/useNotesSidebar";

interface NoteGroupSectionProps {
  category: string;
  notes: NoteMetadata[];
  sortBy: string;
  categoryIndex: number;
  currentNoteId: string | null;
  formatDate: (date: string) => string;
  onSelectNote: (path: string) => void;
  onArchiveNote: (path: string) => void;
  onDeleteNote: (path: string) => void;
}

export const NoteGroupSection = React.memo(function NoteGroupSection({
  category,
  notes,
  sortBy,
  categoryIndex,
  currentNoteId,
  formatDate,
  onSelectNote,
  onArchiveNote,
  onDeleteNote,
}: NoteGroupSectionProps) {
  if (notes.length === 0) return null;

  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
        {category}
      </h3>
      {notes.map((note, index) => {
        const isArchived = note.path.startsWith("archive/");
        return (
          <div key={`${sortBy}-${category}-${categoryIndex}-${index}-${note.path}`}>
            <NoteListItem
              title={note.title}
              modified={note.modified}
              path={note.path}
              isArchived={isArchived}
              isSelected={currentNoteId === note.path}
              formatDate={formatDate}
              onSelect={() => onSelectNote(note.path)}
              onArchive={() => onArchiveNote(note.path)}
              onDelete={() => onDeleteNote(note.path)}
            />
            {index < notes.length - 1 && (
              <Separator className="my-1" />
            )}
          </div>
        );
      })}
    </div>
  );
});
