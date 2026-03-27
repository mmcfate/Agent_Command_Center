interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = "", style, onClick }: CardProps) {
  return (
    <div
      className={`bg-bg-surface rounded-lg ${className}`}
      style={{ border: "1px solid #2a2a3a", ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string | React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({ title, icon }: CardHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #2a2a3a" }}>
      {icon}
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
