/**
 * Shared form fields for board name and icon
 * Used in both create and edit board forms
 */

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface BoardFormFieldsProps {
  nameValue: string;
  onNameChange: (value: string) => void;
  iconValue: string;
  onIconChange: (value: string) => void;
  onIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nameLabel?: string;
  iconLabel?: string;
  namePlaceholder?: string;
  inputIdPrefix: string;
}

export const BoardFormFields = memo(function BoardFormFields({
  nameValue,
  onNameChange,
  iconValue,
  onIconChange,
  onIconUpload,
  nameLabel = "Board Name",
  iconLabel = "Board Icon",
  namePlaceholder = "My Project Board",
  inputIdPrefix,
}: BoardFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${inputIdPrefix}-name`}>{nameLabel}</Label>
        <Input
          id={`${inputIdPrefix}-name`}
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={namePlaceholder}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${inputIdPrefix}-icon`}>{iconLabel}</Label>
        <div className="flex gap-2 items-center">
          <Input
            id={`${inputIdPrefix}-icon-emoji`}
            value={iconValue.startsWith('data:') ? '' : iconValue}
            onChange={(e) => onIconChange(e.target.value)}
            placeholder="Enter emoji (e.g., 📋, 🎯, 🚀)"
            className="flex-1"
            maxLength={2}
          />
          <span className="text-muted-foreground">or</span>
          <div className="relative">
            <Input
              id={`${inputIdPrefix}-icon-upload`}
              type="file"
              accept="image/*"
              onChange={onIconUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`${inputIdPrefix}-icon-upload`)?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
        {iconValue && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <span className="text-xs text-muted-foreground">Preview:</span>
            {iconValue.startsWith('data:') ? (
              <img src={iconValue} alt="Icon" className="h-6 w-6 rounded" />
            ) : (
              <span className="text-lg">{iconValue}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
});
