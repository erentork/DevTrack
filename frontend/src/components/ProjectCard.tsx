import { FolderKanban, CalendarDays, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types/project";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="
        group cursor-pointer rounded-2xl border border-slate-800
        bg-slate-900 p-6 transition-all duration-300
        hover:-translate-y-1 hover:border-blue-500
        hover:shadow-2xl hover:shadow-blue-500/10
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
            <FolderKanban size={22} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white">
              {project.name}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {project.description || "No description"}
            </p>
          </div>
        </div>

        <ArrowRight
          size={20}
          className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <CalendarDays size={16} />

          <span className="text-sm">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>

        <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-medium text-blue-400">
          Active
        </span>
      </div>
    </div>
  );
}