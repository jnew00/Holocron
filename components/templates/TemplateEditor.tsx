"use client";

import { memo } from "react";
import { NoteTemplate } from "@/lib/templates/templates";
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
import { NoteType } from "@/lib/notes/types";

interface FormData {
  name: string;
  description: string;
  type: NoteType;
  content: string;
}

interface TemplateEditorProps {
  isEditing: boolean;
  editingTemplate: NoteTemplate | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TemplateEditor = memo(function TemplateEditor({
  isEditing,
  editingTemplate,
  formData,
  setFormData,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  return (
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
            <Button onClick={onSave} className="flex-1">
              Save Template
            </Button>
            <Button variant="outline" onClick={onCancel}>
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
  );
});
