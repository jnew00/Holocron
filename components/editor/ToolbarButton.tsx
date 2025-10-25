"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}

export const ToolbarButton = React.memo(({
  onClick,
  disabled,
  active,
  children,
  title,
}: ToolbarButtonProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="h-8 w-8 p-0"
  >
    {children}
  </Button>
));

ToolbarButton.displayName = "ToolbarButton";
