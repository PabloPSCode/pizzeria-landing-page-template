"use client";

import type { ReactNode } from "react";
import AnimatedContainer from "./AnimatedContainer";

interface RevealContainerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  delayMs?: number;
}

export default function RevealContainer({
  children,
  className,
  once,
  delayMs,
}: RevealContainerProps) {
  return (
    <AnimatedContainer
      className={className}
      once={once}
      delayMs={delayMs}
      hiddenClassName="-translate-x-8 opacity-0"
      visibleClassName="translate-x-0 opacity-100"
    >
      {children}
    </AnimatedContainer>
  );
}
