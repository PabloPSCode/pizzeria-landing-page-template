import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}

export default function Section({
  children,
  id,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      className={[
        "w-full scroll-mt-28 py-14 sm:scroll-mt-32 sm:py-18",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6",
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
