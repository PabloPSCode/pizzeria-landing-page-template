"use client";

import { LandingHeader } from "../../../libs/react-ultimate-components/src";

interface MobileMenuToggleButtonProps {
  open: boolean;
  onToggle: (open: boolean) => void;
  className?: string;
}

export default function MobileMenuToggleButton({
  open,
  onToggle,
  className,
}: MobileMenuToggleButtonProps) {
  return (
    <LandingHeader.MobileMenuToggle
      open={open}
      onToggle={onToggle as never}
      className={className}
    />
  );
}
