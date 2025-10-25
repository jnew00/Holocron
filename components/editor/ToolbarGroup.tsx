"use client";

import React from "react";

interface ToolbarGroupProps {
  children: React.ReactNode;
  showDivider?: boolean;
}

export const ToolbarGroup = React.memo(({ children, showDivider = true }: ToolbarGroupProps) => (
  <>
    <div className="flex gap-1">
      {children}
    </div>
    {showDivider && <div className="w-px h-6 bg-border mx-1" />}
  </>
));

ToolbarGroup.displayName = "ToolbarGroup";
