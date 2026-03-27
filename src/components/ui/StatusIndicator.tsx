interface StatusIndicatorProps {
  status: "online" | "offline" | "idle" | "working";
  size?: "sm" | "md";
}

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const sizeClass = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const colorClass =
    status === "online"
      ? "bg-accent-success shadow-glow-green"
      : status === "working"
      ? "bg-accent-warning shadow-glow-blue"
      : status === "idle"
      ? "bg-accent-warning"
      : "bg-text-secondary";

  return (
    <span
      className={`inline-block rounded-full ${sizeClass} ${colorClass} ${
        status === "online" || status === "working" ? "animate-pulse-slow" : ""
      }`}
    />
  );
}
