import type { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}

export default function HeroSection({
  children,
  id,
  className,
  containerClassName,
}: HeroSectionProps) {
  return (
    <section
      id={id}
      className={["relative w-full overflow-hidden", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6",
          containerClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
