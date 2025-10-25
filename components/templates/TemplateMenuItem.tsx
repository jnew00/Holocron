import { memo } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { NoteTemplate } from "@/lib/templates/templates";
import { getTemplateIcon } from "@/lib/templates/templateIcons";

interface TemplateMenuItemProps {
  template: NoteTemplate;
  onSelect: (template: NoteTemplate) => void;
}

export const TemplateMenuItem = memo(function TemplateMenuItem({
  template,
  onSelect,
}: TemplateMenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={() => onSelect(template)}
      className="cursor-pointer"
    >
      <div className="flex items-start w-full">
        {getTemplateIcon(template.icon)}
        <div className="flex-1">
          <div className="font-medium">{template.name}</div>
          <div className="text-xs text-muted-foreground">
            {template.description}
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
});
