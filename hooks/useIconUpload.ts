/**
 * Custom hook for handling icon/image uploads
 * Resizes images to 32x32 and converts to base64
 */

import { useCallback } from "react";

interface UseIconUploadProps {
  onIconChange: (base64: string) => void;
}

export function useIconUpload({ onIconChange }: UseIconUploadProps) {
  const handleIconUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { // 5MB limit
      alert("Image file too large. Please choose an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image to 32x32
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to 32x32 for icon
        const iconSize = 32;
        canvas.width = iconSize;
        canvas.height = iconSize;

        // Draw resized image
        ctx.drawImage(img, 0, 0, iconSize, iconSize);

        // Convert to base64
        const resizedBase64 = canvas.toDataURL('image/png', 0.9);
        onIconChange(resizedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onIconChange]);

  return {
    handleIconUpload,
  };
}
