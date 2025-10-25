"use client";

import { memo } from "react";
import { NoteTemplate } from "@/lib/templates/templates";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, FileText } from "lucide-react";

interface TemplateListProps {
  defaultTemplates: readonly NoteTemplate[];
  customTemplates: NoteTemplate[];
  onEditTemplate: (template: NoteTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNewTemplate: () => void;
}

export const TemplateList = memo(function TemplateList({
  defaultTemplates,
  customTemplates,
  onEditTemplate,
  onDeleteTemplate,
  onNewTemplate,
}: TemplateListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Your Templates</h3>
        <Button size="sm" onClick={onNewTemplate}>
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
                onClick={() => onEditTemplate(template)}
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
                      onClick={() => onEditTemplate(template)}
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
                        onClick={() => onEditTemplate(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteTemplate(template.id)}
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
  );
});
