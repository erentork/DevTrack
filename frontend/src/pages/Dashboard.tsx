import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskDistributionChart from "../components/TaskDistributionChart";
import { getDashboard } from "../services/dashboardService";

import type {
  Dashboard as DashboardType,
  RecentDashboardProject,
  RecentDashboardTask,
} from "../types/dashboard";

import StatCard from "../components/StatCard";

import {
  FolderKanban,
  CheckSquare,
  CircleCheckBig,
  TriangleAlert,
  ArrowRight,
  Clock3,
  ListTodo,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const dashboardData = await getDashboard();

      setDashboard(dashboardData);
    } catch (error) {
      console.error("Dashboard loading failed:", error);

      setDashboard(null);
      setError("Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  const productivity = Math.round(
    dashboard?.completionRate ?? 0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

            <p className="mt-4 text-slate-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <TriangleAlert
              className="mx-auto text-red-400"
              size={38}
            />

            <h2 className="mt-4 text-xl font-semibold">
              Dashboard unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {error || "Dashboard data could not be loaded."}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section>
        <div>
          <p className="text-sm font-medium text-blue-400">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Track your projects, tasks and overall progress.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Projects"
            value={dashboard.projectCount}
            subtitle="Total projects"
            icon={<FolderKanban size={28} />}
          />

          <StatCard
            title="Tasks"
            value={dashboard.taskCount}
            subtitle="All tasks"
            icon={<CheckSquare size={28} />}
          />

          <StatCard
            title="Completed"
            value={dashboard.completedTasks}
            subtitle="Completed tasks"
            icon={<CircleCheckBig size={28} />}
          />

          <StatCard
            title="Overdue"
            value={dashboard.overdueTasks}
            subtitle="Need attention"
            icon={<TriangleAlert size={28} />}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <RecentProjects
            projects={dashboard.recentProjects}
            onViewAll={() => navigate("/projects")}
            onOpenProject={(projectId) =>
              navigate(`/projects/${projectId}`)
            }
          />

          <RecentTasks
            tasks={dashboard.recentTasks}
            onOpenProject={(projectId) =>
              navigate(`/projects/${projectId}`)
            }
          />
        </div>

        <div className="space-y-8">
          <ProductivityCard
            productivity={productivity}
            completedTasks={dashboard.completedTasks}
            taskCount={dashboard.taskCount}
          />

          <TaskDistributionChart
  todoTasks={dashboard.todoTasks}
  inProgressTasks={dashboard.inProgressTasks}
  completedTasks={dashboard.completedTasks}
/>
        </div>
      </section>
    </DashboardLayout>
  );
}

type RecentProjectsProps = {
  projects: RecentDashboardProject[];
  onViewAll: () => void;
  onOpenProject: (projectId: string) => void;
};

function RecentProjects({
  projects,
  onViewAll,
  onOpenProject,
}: RecentProjectsProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Recent Projects
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Your latest project activity
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
        >
          View All
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={30} />}
          title="No projects found"
          description="Create your first project to see it here."
        />
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const progress =
              project.taskCount > 0
                ? Math.round(
                    (project.completedTaskCount /
                      project.taskCount) *
                      100
                  )
                : 0;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenProject(project.id)}
                className="group block w-full rounded-xl border border-slate-800 bg-slate-950 p-5 text-left transition-all duration-300 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold">
                      {project.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                      {project.description || "No description"}
                    </p>
                  </div>

                  <ArrowRight
                    className="shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400"
                    size={20}
                  />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {project.completedTaskCount} of{" "}
                      {project.taskCount} tasks completed
                    </span>

                    <span className="font-medium text-slate-300">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type RecentTasksProps = {
  tasks: RecentDashboardTask[];
  onOpenProject: (projectId: string) => void;
};

function RecentTasks({
  tasks,
  onOpenProject,
}: RecentTasksProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Recent Tasks
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          The latest tasks created across your projects
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo size={30} />}
          title="No tasks found"
          description="New tasks will appear here."
        />
      ) : (
        <div className="divide-y divide-slate-800">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenProject(task.projectId)}
              className="group flex w-full items-center justify-between gap-4 py-4 text-left first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-slate-100 transition group-hover:text-blue-400">
                    {task.title}
                  </h3>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                      task.priority
                    )}`}
                  >
                    {getPriorityText(task.priority)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{task.projectName}</span>

                  <span
                    className={`rounded-full px-2 py-1 ${getStatusClass(
                      task.status
                    )}`}
                  >
                    {getStatusText(task.status)}
                  </span>

                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock3 size={13} />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              <ArrowRight
                className="shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                size={18}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type ProductivityCardProps = {
  productivity: number;
  completedTasks: number;
  taskCount: number;
};

function ProductivityCard({
  productivity,
  completedTasks,
  taskCount,
}: ProductivityCardProps) {
  const safeProductivity = Math.min(
    Math.max(productivity, 0),
    100
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">
        Productivity
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Overall task completion rate
      </p>

      <div className="mt-8 flex flex-col items-center">
        <div
          className="relative flex h-44 w-44 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(
              rgb(37 99 235) ${safeProductivity}%,
              rgb(30 41 59) ${safeProductivity}%
            )`,
          }}
        >
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-slate-900">
            <span className="text-4xl font-bold">
              {safeProductivity}%
            </span>

            <span className="mt-1 text-xs text-slate-400">
              completed
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-slate-400">
          {getProductivityMessage(safeProductivity)}
        </p>

        <p className="mt-3 text-sm text-slate-500">
          {completedTasks} of {taskCount} tasks completed
        </p>
      </div>
    </div>
  );
}

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

function getProductivityMessage(productivity: number) {
  if (productivity >= 80) {
    return "Excellent work! Keep it up";
  }

  if (productivity >= 50) {
    return "You're making good progress";
  }

  if (productivity > 0) {
    return "Keep completing tasks to improve your score.";
  }

  return "Start completing tasks to build momentum.";
}

function getStatusText(status: number) {
  switch (status) {
    case 0:
      return "To Do";
    case 1:
      return "In Progress";
    case 2:
      return "Completed";
    default:
      return "Unknown";
  }
}

function getStatusClass(status: number) {
  switch (status) {
    case 0:
      return "bg-slate-700/60 text-slate-300";
    case 1:
      return "bg-blue-500/10 text-blue-400";
    case 2:
      return "bg-emerald-500/10 text-emerald-400";
    default:
      return "bg-slate-700 text-slate-300";
  }
}

function getPriorityText(priority: number) {
  switch (priority) {
    case 0:
      return "Low";
    case 1:
      return "Medium";
    case 2:
      return "High";
    case 3:
      return "Critical";
    default:
      return "Unknown";
  }
}

function getPriorityClass(priority: number) {
  switch (priority) {
    case 0:
      return "bg-slate-700/60 text-slate-300";
    case 1:
      return "bg-amber-500/10 text-amber-400";
    case 2:
      return "bg-orange-500/10 text-orange-400";
    case 3:
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-slate-700 text-slate-300";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}