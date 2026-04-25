import Subtitle from "./Subtitle";
import Title from "./Title";

interface InfoCardProps {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}

export default function InfoCard({
  eyebrow,
  title,
  description,
  className,
}: InfoCardProps) {
  return (
    <div
      className={[
        "min-h-[220px] overflow-hidden rounded-[28px] border border-border-card bg-bg-card p-6 shadow-sm",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Subtitle
        as="span"
        className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary-600"
      >
        {eyebrow}
      </Subtitle>
      <Title
        as="h3"
        className="mt-3 line-clamp-2 text-[1.5rem] leading-tight sm:text-[1.7rem]"
      >
        {title}
      </Title>
      <Subtitle className="mt-2 line-clamp-3 text-sm text-foreground/70">
        {description}
      </Subtitle>
    </div>
  );
}
