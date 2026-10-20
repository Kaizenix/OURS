interface PageHeaderProps {
  title: string;
  subtitle?: string;
  serif?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, serif, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4 pt-6 pb-4 md:px-6">
      <div>
        <h1
          className={`text-2xl font-semibold tracking-tight ${
            serif ? 'font-serif' : ''
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
