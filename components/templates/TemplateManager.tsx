"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { templates as defaultTemplates } from "@/lib/templates/templates";
import { useTemplateManager } from "@/hooks/useTemplateManager";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";

export function TemplateManager() {
  // TODO: This component needs to be updated to use repoPath instead of dirHandle
  const { passphrase } = useRepo();
  const dirHandle = null; // Temporarily disabled until refactored to use repoPath
  const [open, setOpen] = useState(false);

  const {
    customTemplates,
    editingTemplate,
    isEditing,
    formData,
    setFormData,
    setIsEditing,
    handleSaveTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    resetForm,
  } = useTemplateManager(dirHandle, passphrase, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Manage Templates">
          <FileEdit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Template Manager</DialogTitle>
          <DialogDescription>
            Create, edit, and manage your note templates
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <TemplateList
            defaultTemplates={defaultTemplates}
            customTemplates={customTemplates}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onNewTemplate={() => setIsEditing(true)}
          />
          <TemplateEditor
            isEditing={isEditing}
            editingTemplate={editingTemplate}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveTemplate}
            onCancel={resetForm}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
