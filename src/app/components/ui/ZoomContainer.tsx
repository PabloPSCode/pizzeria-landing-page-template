"use client";

import type { ReactNode } from "react";
import AnimatedContainer from "./AnimatedContainer";

interface ZoomContainerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  delayMs?: number;
}

export default function ZoomContainer({
  children,
  className,
  once,
  delayMs,
}: ZoomContainerProps) {
  return (
    <AnimatedContainer
      className={className}
      once={once}
      delayMs={delayMs}
      hiddenClassName="scale-[0.96] opacity-0"
      visibleClassName="scale-100 opacity-100"
    >
      {children}
    </AnimatedContainer>
  );
}
