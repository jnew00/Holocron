import {
  FileText,
  Calendar,
  Users,
  Edit,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  BookOpen,
} from "lucide-react";

export const iconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  FileText,
  Calendar,
  Users,
  Edit,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  BookOpen,
};

export function getTemplateIcon(iconName: string): React.ReactElement {
  const Icon = iconMap[iconName] || FileText;
  return <Icon className="h-4 w-4 mr-2" />;
}
