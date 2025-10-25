/**
 * Custom hook for template management operations
 * Encapsulates template loading, creation, editing, and deletion
 */

import { useState, useEffect, useCallback } from "react";
import { NoteTemplate } from "@/lib/templates/templates";
import {
  loadCustomTemplates,
  addCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
} from "@/lib/templates/customTemplates";
import { NoteType } from "@/lib/notes/types";

interface FormData {
  name: string;
  description: string;
  type: NoteType;
  content: string;
}

export function useTemplateManager(
  dirHandle: FileSystemDirectoryHandle | null,
  passphrase: string | null,
  open: boolean
) {
  const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    type: "note",
    content: "",
  });

  useEffect(() => {
    if (open && dirHandle && passphrase) {
      loadTemplates();
    }
  }, [open, dirHandle, passphrase]);

  const loadTemplates = useCallback(async () => {
    if (!dirHandle || !passphrase) return;
    const loaded = await loadCustomTemplates(dirHandle, passphrase);
    setCustomTemplates(loaded);
  }, [dirHandle, passphrase]);

  const handleSaveTemplate = useCallback(async () => {
    if (!dirHandle || !passphrase) return;
    if (!formData.name || !formData.content) return;

    const template: NoteTemplate = {
      id: editingTemplate?.id || `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      icon: "FileText",
      type: formData.type,
      content: formData.content,
    };

    if (isEditing && editingTemplate) {
      await updateCustomTemplate(dirHandle, editingTemplate.id, template, passphrase);
    } else {
      await addCustomTemplate(dirHandle, template, passphrase);
    }

    await loadTemplates();
    resetForm();
  }, [dirHandle, passphrase, formData, isEditing, editingTemplate, loadTemplates]);

  const handleEditTemplate = useCallback((template: NoteTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      content: template.content,
    });
    setIsEditing(true);
  }, []);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (!dirHandle || !passphrase) return;
    if (!confirm("Are you sure you want to delete this template?")) return;

    await deleteCustomTemplate(dirHandle, templateId, passphrase);
    await loadTemplates();
  }, [dirHandle, passphrase, loadTemplates]);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      type: "note",
      content: "",
    });
    setEditingTemplate(null);
    setIsEditing(false);
  }, []);

  return {
    // State
    customTemplates,
    editingTemplate,
    isEditing,
    formData,
    setFormData,
    setIsEditing,

    // Actions
    handleSaveTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    resetForm,
  };
}
