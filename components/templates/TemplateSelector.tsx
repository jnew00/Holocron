"use client";

import { useRepo } from "@/contexts/RepoContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NoteTemplate } from "@/lib/templates/templates";
import { TemplateManager } from "./TemplateManager";
import { TemplateMenuItem } from "./TemplateMenuItem";
import { useTemplateSelector } from "@/hooks/useTemplateSelector";
import { FileText, ChevronDown } from "lucide-react";

interface TemplateSelectorProps {
  onSelectTemplate: (template: NoteTemplate) => void;
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  // TODO: This component needs to be updated to use repoPath instead of dirHandle
  const { passphrase } = useRepo();
  const dirHandle = null; // Temporarily disabled until refactored to use repoPath
  const { customTemplates, defaultTemplates } = useTemplateSelector(
    dirHandle,
    passphrase
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            New Note
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Choose a Template</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Default Templates */}
          <DropdownMenuGroup>
            {defaultTemplates.map((template) => (
              <TemplateMenuItem
                key={template.id}
                template={template}
                onSelect={onSelectTemplate}
              />
            ))}
          </DropdownMenuGroup>

          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Custom Templates</DropdownMenuLabel>
              <DropdownMenuGroup>
                {customTemplates.map((template) => (
                  <TemplateMenuItem
                    key={template.id}
                    template={template}
                    onSelect={onSelectTemplate}
                  />
                ))}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <TemplateManager />
    </div>
  );
}
