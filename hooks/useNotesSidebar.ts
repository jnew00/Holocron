import { useState, useEffect, useRef } from "react";
import { useRepo } from "@/contexts/RepoContext";

interface NoteMetadata {
  name: string;
  path: string;
  title: string;
  modified: string;
  size: number;
  type?: string;
}

type SortBy = "time" | "type";

interface UseNotesSidebarProps {
  refreshTrigger?: number;
}

export function useNotesSidebar({ refreshTrigger }: UseNotesSidebarProps = {}) {
  const { repoPath } = useRepo();
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("time");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadNotes = async () => {
    if (!repoPath) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/notes/list?repoPath=${encodeURIComponent(repoPath)}`
      );

      if (response.ok) {
        const data = await response.json();

        // Transform API response to match our NoteMetadata format
        const loadedNotes: NoteMetadata[] = data.notes
          .filter((note: any) => {
            const isArchived = note.path.startsWith("archive/");
            return showArchived ? isArchived : !isArchived;
          })
          .map((note: any) => {
            // Use title from API (extracted from H1) or fallback to filename
            const title = note.title || note.name.replace(".md", "")
              .split("-")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            return {
              name: note.name,
              path: note.path,
              title,
              modified: note.modified,
              size: note.size,
              type: note.type || "note",
            };
          });

        setNotes(loadedNotes);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [repoPath, showArchived, refreshTrigger]);

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 240 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by type category
  const groupNotesByType = (notes: NoteMetadata[]) => {
    const groups: Record<string, NoteMetadata[]> = {
      "TODO Lists": [],
      "Meetings": [],
      "Scratchpads": [],
      "Today I Learned": [],
      "Projects": [],
      "Weekly Reviews": [],
      "Books": [],
      "Notes": [],
    };

    notes.forEach((note) => {
      const type = note.type || "note";
      switch (type) {
        case "todo":
          groups["TODO Lists"].push(note);
          break;
        case "meeting":
          groups["Meetings"].push(note);
          break;
        case "scratchpad":
          groups["Scratchpads"].push(note);
          break;
        case "til":
          groups["Today I Learned"].push(note);
          break;
        case "project":
          groups["Projects"].push(note);
          break;
        case "weekly":
          groups["Weekly Reviews"].push(note);
          break;
        case "book":
          groups["Books"].push(note);
          break;
        default:
          groups["Notes"].push(note);
      }
    });

    return groups;
  };

  // Group notes by time category
  const groupNotesByTime = (notes: NoteMetadata[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const groups: Record<string, NoteMetadata[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    notes.forEach((note) => {
      const noteDate = new Date(note.modified);
      if (noteDate >= today) {
        groups.Today.push(note);
      } else if (noteDate >= yesterday) {
        groups.Yesterday.push(note);
      } else if (noteDate >= thisWeekStart) {
        groups["This Week"].push(note);
      } else if (noteDate >= thisMonthStart) {
        groups["This Month"].push(note);
      } else {
        groups.Older.push(note);
      }
    });

    return groups;
  };

  const groupedNotes =
    sortBy === "time"
      ? groupNotesByTime(filteredNotes)
      : groupNotesByType(filteredNotes);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteConfirm = (onDeleteNote: (path: string) => void) => {
    if (deleteConfirmNote) {
      onDeleteNote(deleteConfirmNote);
      setDeleteConfirmNote(null);
      loadNotes();
    }
  };

  const handleArchiveNote = (
    notePath: string,
    onArchiveNote: (path: string) => void
  ) => {
    onArchiveNote(notePath);
    loadNotes();
  };

  return {
    // State
    notes: filteredNotes,
    groupedNotes,
    searchQuery,
    showArchived,
    loading,
    deleteConfirmNote,
    sortBy,
    sidebarWidth,
    isResizing,
    sidebarRef,

    // Setters
    setSearchQuery,
    setShowArchived,
    setDeleteConfirmNote,
    setSortBy,
    setIsResizing,

    // Handlers
    loadNotes,
    handleDeleteConfirm,
    handleArchiveNote,
    formatDate,
  };
}

export type { NoteMetadata, SortBy };
