"use client";

import { useState, useEffect } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { NoteTemplate, templates as defaultTemplates } from "@/lib/templates/templates";
import {
  loadCustomTemplates,
  addCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
} from "@/lib/templates/customTemplates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileEdit, Plus, Edit, Trash2, FileText } from "lucide-react";
import { NoteType } from "@/lib/notes/noteManager";

export function TemplateManager() {
  // TODO: This component needs to be updated to use repoPath instead of dirHandle
  const { passphrase } = useRepo();
  const dirHandle = null; // Temporarily disabled until refactored to use repoPath
  const [open, setOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "note" as NoteType,
    content: "",
  });

  useEffect(() => {
    if (open && dirHandle && passphrase) {
      loadTemplates();
    }
  }, [open, dirHandle, passphrase]);

  const loadTemplates = async () => {
    if (!dirHandle || !passphrase) return;
    const loaded = await loadCustomTemplates(dirHandle, passphrase);
    setCustomTemplates(loaded);
  };

  const handleSaveTemplate = async () => {
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
  };

  const handleEditTemplate = (template: NoteTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      content: template.content,
    });
    setIsEditing(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!dirHandle || !passphrase) return;
    if (!confirm("Are you sure you want to delete this template?")) return;

    await deleteCustomTemplate(dirHandle, templateId, passphrase);
    await loadTemplates();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "note",
      content: "",
    });
    setEditingTemplate(null);
    setIsEditing(false);
  };

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
          {/* Template List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your Templates</h3>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-2">
              <div className="space-y-2">
                {/* Default Templates (Read-only) */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase mb-2 px-2">
                    Default Templates
                  </p>
                  {defaultTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Templates */}
                {customTemplates.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2 px-2">
                      Custom Templates
                    </p>
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-2 rounded hover:bg-muted group"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Template Editor */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {isEditing ? (editingTemplate ? "Edit Template" : "New Template") : "Template Preview"}
            </h3>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="template-name">Name</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Template name"
                  />
                </div>

                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <Label htmlFor="template-type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as NoteType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="todo">TODO</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="scratchpad">Scratchpad</SelectItem>
                      <SelectItem value="til">Today I Learned</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="weekly">Weekly Review</SelectItem>
                      <SelectItem value="book">Book Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-content">Content (Markdown)</Label>
                  <Textarea
                    id="template-content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="# Template Title&#10;&#10;Your template content here..."
                    className="h-[240px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} className="flex-1">
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 h-[400px] overflow-auto">
                <p className="text-sm text-muted-foreground">
                  Select a template to view or edit
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
