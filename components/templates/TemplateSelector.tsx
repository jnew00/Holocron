"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getAllTemplates, NoteTemplate } from "@/lib/templates/templates";
import {
  FileText,
  Calendar,
  Users,
  Edit,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  BookOpen,
  ChevronDown,
} from "lucide-react";

interface TemplateSelectorProps {
  onSelectTemplate: (template: NoteTemplate) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Calendar,
  Users,
  Edit,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  BookOpen,
};

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const templates = getAllTemplates();

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || FileText;
    return <Icon className="h-4 w-4 mr-2" />;
  };

  return (
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
        <DropdownMenuGroup>
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="cursor-pointer"
            >
              <div className="flex items-start w-full">
                {getIcon(template.icon)}
                <div className="flex-1">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.description}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
