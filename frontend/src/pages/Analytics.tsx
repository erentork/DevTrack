import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";

import TaskActivityChart from "../components/TaskActivityChart";
import TaskDistributionChart from "../components/TaskDistributionChart";

import { getDashboard } from "../services/dashboardService";
import type { Dashboard as DashboardType } from "../types/dashboard";

import {
  Activity,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  TriangleAlert,
} from "lucide-react";

export default function Analytics() {
  const [dashboard, setDashboard] =
    useState<DashboardType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboard();

      setDashboard(data);
    } catch (error) {
      console.error("Analytics loading failed:", error);

      setDashboard(null);
      setError("Analytics data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

            <p className="mt-4 text-slate-400">
              Loading analytics...
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
              size={40}
            />

            <h2 className="mt-4 text-xl font-semibold">
              Analytics unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadAnalytics}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completionRate = Math.round(
    dashboard.completionRate
  );

  const activeTasks =
    dashboard.todoTasks +
    dashboard.inProgressTasks;

  const completedProjectRate =
    dashboard.projectCount > 0
      ? Math.round(
          (
            dashboard.recentProjects.filter(
              (project) =>
                project.taskCount > 0 &&
                project.taskCount ===
                  project.completedTaskCount
            ).length /
            dashboard.projectCount
          ) * 100
        )
      : 0;

  return (
    <DashboardLayout>
      <section>
        <p className="text-sm font-medium text-blue-400">
          Insights
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Analytics
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor task progress and project performance.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle="Across all tasks"
          icon={<CheckCircle2 size={26} />}
        />

        <AnalyticsCard
          title="Active Tasks"
          value={activeTasks}
          subtitle="To do and in progress"
          icon={<Activity size={26} />}
        />

        <AnalyticsCard
          title="Overdue Tasks"
          value={dashboard.overdueTasks}
          subtitle="Require attention"
          icon={<TriangleAlert size={26} />}
        />

        <AnalyticsCard
          title="Projects"
          value={dashboard.projectCount}
          subtitle="Total projects"
          icon={<FolderKanban size={26} />}
        />
      </section>

      <section className="mt-8">
        <TaskActivityChart
          stats={dashboard.dailyTaskStats}
        />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <StatusOverview dashboard={dashboard} />
        </div>

        <div className="min-w-0">
          <TaskDistributionChart
            todoTasks={dashboard.todoTasks}
            inProgressTasks={dashboard.inProgressTasks}
            completedTasks={dashboard.completedTasks}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <ProjectPerformance dashboard={dashboard} />

        <PerformanceSummary
          completionRate={completionRate}
          completedProjectRate={completedProjectRate}
          activeTasks={activeTasks}
          overdueTasks={dashboard.overdueTasks}
        />
      </section>
    </DashboardLayout>
  );
}

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
};

function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
}: AnalyticsCardProps) {
  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex h-full items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

type DashboardSectionProps = {
  dashboard: DashboardType;
};

function StatusOverview({
  dashboard,
}: DashboardSectionProps) {
  const totalTasks = dashboard.taskCount;

  const rows = [
    {
      label: "To Do",
      value: dashboard.todoTasks,
      className: "bg-slate-500",
    },
    {
      label: "In Progress",
      value: dashboard.inProgressTasks,
      className: "bg-blue-500",
    },
    {
      label: "Completed",
      value: dashboard.completedTasks,
      className: "bg-emerald-500",
    },
    {
      label: "Overdue",
      value: dashboard.overdueTasks,
      className: "bg-red-500",
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Status Overview
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Distribution of tasks by status
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {rows.map((row) => {
          const percentage =
            totalTasks > 0
              ? Math.round(
                  (row.value / totalTasks) * 100
                )
              : 0;

          return (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${row.className}`}
                  />

                  <span className="text-slate-300">
                    {row.label}
                  </span>
                </div>

                <span className="text-slate-400">
                  {row.value} ({percentage}%)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${row.className}`}
                  style={{
                    width: `${Math.min(
                      percentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectPerformance({
  dashboard,
}: DashboardSectionProps) {
  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Project Performance
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Completion progress of recent projects
        </p>
      </div>

      {dashboard.recentProjects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
          No project data available.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {dashboard.recentProjects.map((project) => {
            const progress =
              project.taskCount > 0
                ? Math.round(
                    (
                      project.completedTaskCount /
                      project.taskCount
                    ) * 100
                  )
                : 0;

            return (
              <div
                key={project.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">
                      {project.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {project.completedTaskCount} of{" "}
                      {project.taskCount} tasks completed
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-blue-400">
                    {progress}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        progress,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type PerformanceSummaryProps = {
  completionRate: number;
  completedProjectRate: number;
  activeTasks: number;
  overdueTasks: number;
};

function PerformanceSummary({
  completionRate,
  completedProjectRate,
  activeTasks,
  overdueTasks,
}: PerformanceSummaryProps) {
  const items = [
    {
      label: "Task completion",
      value: `${completionRate}%`,
      icon: <CheckCircle2 size={20} />,
    },
    {
      label: "Completed projects",
      value: `${completedProjectRate}%`,
      icon: <FolderKanban size={20} />,
    },
    {
      label: "Active workload",
      value: activeTasks,
      icon: <ListTodo size={20} />,
    },
    {
      label: "Tasks needing attention",
      value: overdueTasks,
      icon: <Clock3 size={20} />,
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Performance Summary
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Key productivity indicators
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-slate-950 p-5"
          >
            <div className="text-blue-400">
              {item.icon}
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}