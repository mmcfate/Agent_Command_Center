"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  FolderKanban,
  CheckSquare,
  Server,
  DollarSign,
  Network,
} from "lucide-react";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/workflow", label: "Workflow", icon: GitBranch },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/cost", label: "Cost", icon: DollarSign },
  { href: "/org", label: "Org Chart", icon: Network },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/todo", label: "Shared TODO", icon: CheckSquare },
  { href: "/system", label: "System", icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex flex-col h-full" style={{ backgroundColor: "var(--color-bg-surface)", borderRight: "1px solid var(--color-border)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid #2a2a3a" }}>
        <h1 className="text-sm font-semibold tracking-tight" style={{ color: "#f0f0f5" }}>
          Agent Command Center
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "#8888a0" }}>Marlin&apos;s Team</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150"
              style={
                isActive
                  ? { backgroundColor: "rgba(74, 158, 255, 0.15)", color: "#4a9eff", border: "1px solid rgba(74, 158, 255, 0.3)" }
                  : { color: "#8888a0" }
              }
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1a1a25"; (e.currentTarget as HTMLAnchorElement).style.color = "#f0f0f5"; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#8888a0"; } }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid #2a2a3a" }}>
        <div className="px-3 py-2 text-xs" style={{ color: "#8888a0" }}>
          <p>v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
