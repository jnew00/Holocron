import { useState, useEffect } from "react";
import { getAllTemplates, NoteTemplate } from "@/lib/templates/templates";
import { loadCustomTemplates } from "@/lib/templates/customTemplates";

interface UseTemplateSelectorReturn {
  customTemplates: NoteTemplate[];
  defaultTemplates: NoteTemplate[];
}

export function useTemplateSelector(
  dirHandle: FileSystemDirectoryHandle | null,
  passphrase: string | null
): UseTemplateSelectorReturn {
  const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>([]);
  const defaultTemplates = getAllTemplates();

  useEffect(() => {
    loadCustom();
  }, [dirHandle, passphrase]);

  const loadCustom = async () => {
    if (!dirHandle || !passphrase) return;
    const loaded = await loadCustomTemplates(dirHandle, passphrase);
    setCustomTemplates(loaded);
  };

  return {
    customTemplates,
    defaultTemplates,
  };
}
