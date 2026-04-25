import type { ReactNode } from "react";
import Subtitle from "./Subtitle";
import Title from "./Title";

interface InfoIconProps {
  icon: ReactNode;
  title: string;
  className?: string;
}

export default function InfoIcon({
  icon,
  title,
  className,
}: InfoIconProps) {
  return (
    <div
      className={[
        "min-h-[120px] min-w-0",
        "flex flex-col items-center gap-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-full mx-auto flex justify-center text-primary-600">
        {icon}
      </div>
      <div className="min-w-0">

        <Title
          as="h3"
          className="mt-3 !text-2xl !xl:text-4xl leading-tight text-center"
        >
          {title}
        </Title>

      </div>
    </div>
  );
}
