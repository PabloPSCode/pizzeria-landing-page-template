"use client";

import type { ReactNode } from "react";
import AnimatedContainer from "./AnimatedContainer";

interface FadeContainerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  delayMs?: number;
}

export default function FadeContainer({
  children,
  className,
  once,
  delayMs,
}: FadeContainerProps) {
  return (
    <AnimatedContainer
      className={className}
      once={once}
      delayMs={delayMs}
      hiddenClassName="translate-y-6 opacity-0"
      visibleClassName="translate-y-0 opacity-100"
    >
      {children}
    </AnimatedContainer>
  );
}
