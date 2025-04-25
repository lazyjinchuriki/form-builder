import { Separator } from "@/components/ui/separator";

interface DividerFieldProps {
  title?: string;
  description?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}

export function DividerField({
  title,
  description,
  orientation = "horizontal",
  decorative = true,
  className = "",
}: DividerFieldProps) {
  return (
    <div className="w-full py-4">
      {title && <h3 className="text-lg font-medium mb-1">{title}</h3>}

      {description && (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      )}

      <Separator
        orientation={orientation}
        decorative={decorative}
        className={className}
      />
    </div>
  );
}
