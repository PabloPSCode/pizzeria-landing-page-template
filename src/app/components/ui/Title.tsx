import type { ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span";
}

export default function Title({
  children,
  className,
  as = "h2",
}: TitleProps) {
  const Component = as;

  return (
    <Component
      className={[
        "min-w-0 font-secondary text-balance break-words text-[1.85rem] font-bold leading-[1.02] tracking-[-0.02em] text-foreground sm:text-[2.35rem] lg:text-[2.85rem]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
