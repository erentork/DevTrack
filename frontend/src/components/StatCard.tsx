import type { ReactNode } from "react";

type Props = {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: Props) {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-500
        hover:shadow-xl
        hover:shadow-blue-500/10
      "
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {value}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            {subtitle}
          </p>

        </div>

        <div
          className="
            rounded-xl
            bg-blue-600/20
            p-4
            text-blue-400
            transition
            group-hover:scale-110
          "
        >
          {icon}
        </div>

      </div>
    </div>
  );
}