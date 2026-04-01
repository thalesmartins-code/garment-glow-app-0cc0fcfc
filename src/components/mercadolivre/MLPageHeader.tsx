interface Props {
  title: string;
  children?: React.ReactNode;
  lastUpdated?: Date | null;
}

export function MLPageHeader({ title, children, lastUpdated }: Props) {
  const formattedDate = lastUpdated
    ? lastUpdated.toLocaleString("pt-BR")
    : null;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground/70">
          {formattedDate ? `Última sinc: ${formattedDate}` : "Nunca sincronizado"}
        </p>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
