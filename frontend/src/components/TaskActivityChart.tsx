import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";

import { Line } from "react-chartjs-2";

import type { DailyTaskStat } from "../types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type TaskActivityChartProps = {
  stats: DailyTaskStat[];
};

export default function TaskActivityChart({
  stats,
}: TaskActivityChartProps) {
  const orderedStats = [...stats].sort(
    (first, second) =>
      new Date(first.date).getTime() -
      new Date(second.date).getTime()
  );

  const labels = orderedStats.map(item =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(item.date))
  );

  const data: ChartData<"line"> = {
    labels,

    datasets: [
      {
        label: "Created Tasks",
        data: orderedStats.map(item => item.createdTasks),
        borderColor: "rgb(59 130 246)",
        backgroundColor: "rgb(59 130 246)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
      },
      {
        label: "Completed Tasks",
        data: orderedStats.map(item => item.completedTasks),
        borderColor: "rgb(16 185 129)",
        backgroundColor: "rgb(16 185 129)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top",

        labels: {
          color: "rgb(203 213 225)",
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 20,
        },
      },

      tooltip: {
        backgroundColor: "rgb(15 23 42)",
        titleColor: "rgb(248 250 252)",
        bodyColor: "rgb(203 213 225)",
        borderColor: "rgb(51 65 85)",
        borderWidth: 1,
        padding: 12,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "rgb(148 163 184)",
        },

        border: {
          color: "rgb(51 65 85)",
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "rgb(148 163 184)",
          precision: 0,
          stepSize: 1,
        },

        grid: {
          color: "rgba(148, 163, 184, 0.08)",
        },

        border: {
          display: false,
        },
      },
    },
  };

  const createdTotal = orderedStats.reduce(
    (total, item) => total + item.createdTasks,
    0
  );

  const completedTotal = orderedStats.reduce(
    (total, item) => total + item.completedTasks,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold">
            Task Activity
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Created and completed tasks during the last 7 days
          </p>
        </div>

        <div className="flex gap-3">
          <SummaryBadge
            label="Created"
            value={createdTotal}
            className="bg-blue-500/10 text-blue-400"
          />

          <SummaryBadge
            label="Completed"
            value={completedTotal}
            className="bg-emerald-500/10 text-emerald-400"
          />
        </div>
      </div>

      <div className="mt-8 h-80">
        <Line
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}

type SummaryBadgeProps = {
  label: string;
  value: number;
  className: string;
};

function SummaryBadge({
  label,
  value,
  className,
}: SummaryBadgeProps) {
  return (
    <div
      className={`rounded-xl px-4 py-2 text-sm font-medium ${className}`}
    >
      {value} {label}
    </div>
  );
}