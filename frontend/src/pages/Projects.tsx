import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";

import {
  getMyProjects,
  createProject,
} from "../services/projectService";

import type { Project } from "../types/project";

import { Search, Plus } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch (err) {
      console.error("Projects could not be loaded:", err);
    }
  }

  async function handleCreate(
    name: string,
    description: string
  ) {
    try {
      await createProject({
        name,
        description,
      });

      await loadProjects();
    } catch (err) {
      console.error("Project creation failed:", err);
      alert("Project could not be created.");
      throw err;
    }
  }

  const filtered = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}

      <div className="mb-10 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Projects
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all your software projects.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            font-semibold
            transition
            hover:bg-blue-700
          "
        >
          <Plus size={20} />
          New Project
        </button>

      </div>

      {/* Search */}

      <div className="relative mb-8">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search project..."
          className="
            w-full
            rounded-xl
            border
            border-slate-800
            bg-slate-900
            py-3
            pl-12
            pr-4
            outline-none
            transition
            focus:border-blue-500
          "
        />

      </div>

      {/* Project List */}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

          <h2 className="text-xl font-semibold">
            No Projects Found
          </h2>

          <p className="mt-3 text-slate-400">
            Click "New Project" to create your first project.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </DashboardLayout>
  );
}