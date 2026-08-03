import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartOptions,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

type TaskDistributionChartProps = {
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
};

export default function TaskDistributionChart({
  todoTasks,
  inProgressTasks,
  completedTasks,
}: TaskDistributionChartProps) {
  const totalTasks =
    todoTasks + inProgressTasks + completedTasks;

  const hasTasks = totalTasks > 0;

  const data = {
    labels: ["To Do", "In Progress", "Completed"],

    datasets: [
      {
        data: hasTasks
          ? [
              todoTasks,
              inProgressTasks,
              completedTasks,
            ]
          : [1],

        backgroundColor: hasTasks
          ? [
              "rgb(100 116 139)",
              "rgb(59 130 246)",
              "rgb(16 185 129)",
            ]
          : ["rgb(30 41 59)"],

        borderColor: "rgb(15 23 42)",
        borderWidth: 4,
        hoverOffset: hasTasks ? 8 : 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: hasTasks,

        callbacks: {
          label(context) {
            const value = context.raw as number;

            const percentage =
              totalTasks > 0
                ? Math.round((value / totalTasks) * 100)
                : 0;

            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Task Distribution
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Tasks grouped by their current status
        </p>
      </div>

      <div className="relative mx-auto mt-6 h-64 max-w-64">
        <Doughnut
          data={data}
          options={options}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">
            {totalTasks}
          </span>

          <span className="mt-1 text-xs text-slate-400">
            Total Tasks
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <LegendRow
          label="To Do"
          value={todoTasks}
          dotClass="bg-slate-500"
        />

        <LegendRow
          label="In Progress"
          value={inProgressTasks}
          dotClass="bg-blue-500"
        />

        <LegendRow
          label="Completed"
          value={completedTasks}
          dotClass="bg-emerald-500"
        />
      </div>
    </div>
  );
}

type LegendRowProps = {
  label: string;
  value: number;
  dotClass: string;
};

function LegendRow({
  label,
  value,
  dotClass,
}: LegendRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <span className="text-sm text-slate-300">
          {label}
        </span>
      </div>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}