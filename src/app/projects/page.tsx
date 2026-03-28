"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Folder, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

const BACKEND = "http://localhost:3001";

interface Project {
  id: string;
  name: string;
  description?: string;
  plan?: string;
  taskCount: { total: number; done: number };
  lastActivity?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/api/dashboard/projects`)
      .then(r => r.json())
      .then(d => { setProjects(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>Projects</h1>
        <p className="text-sm italic" style={{ color: "#8888a0" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>Projects</h1>
        <span className="text-xs" style={{ color: "#8888a0" }}>{projects.length} projects</span>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm italic text-center" style={{ color: "#8888a0" }}>
              No projects yet. Create a project folder in ~/.openclaw/projects/
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:opacity-90 transition-opacity cursor-pointer">
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder size={16} style={{ color: "#4a9eff" }} />
                      <span className="text-sm font-medium" style={{ color: "#f0f0f5" }}>{project.name}</span>
                    </div>
                    <ArrowRight size={14} style={{ color: "#8888a0" }} />
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: "#8888a0" }}>
                    {project.description || "No description"}
                  </p>
                  <div className="flex items-center gap-3 pt-1" style={{ borderTop: "1px solid #2a2a3a" }}>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={12} style={{ color: "#34d399" }} />
                      <span className="text-xs" style={{ color: "#8888a0" }}>{project.taskCount?.done || 0} done</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Circle size={12} style={{ color: "#8888a0" }} />
                      <span className="text-xs" style={{ color: "#8888a0" }}>{project.taskCount?.total || 0} total</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
