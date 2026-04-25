"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  delayMs?: number;
  durationMs?: number;
  hiddenClassName: string;
  visibleClassName: string;
}

export default function AnimatedContainer({
  children,
  className,
  once = false,
  delayMs = 0,
  durationMs = 700,
  hiddenClassName,
  visibleClassName,
}: AnimatedContainerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className={[
        "transition-all ease-out will-change-transform",
        isVisible ? visibleClassName : hiddenClassName,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
