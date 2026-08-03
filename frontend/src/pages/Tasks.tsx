import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  FolderKanban,
  ListFilter,
  ListTodo,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Save,
  Search,
  Timer,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  deleteTask,
  getMyTasks,
  updateTask,
} from "../services/taskService";

import type {
  MyTaskItem,
} from "../types/task";

type StatusFilter =
  | "all"
  | "todo"
  | "inProgress"
  | "completed";

type PriorityFilter =
  | "all"
  | "low"
  | "medium"
  | "high";

type DueDateFilter =
  | "all"
  | "overdue"
  | "today"
  | "next7Days"
  | "noDueDate";

type SortOption =
  | "newest"
  | "oldest"
  | "dueDate"
  | "priority";

type EditTaskForm = {
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate: string;
};

const emptyEditForm: EditTaskForm = {
  title: "",
  description: "",
  status: 0,
  priority: 1,
  dueDate: "",
};

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] =
    useState<MyTaskItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState<PriorityFilter>("all");

  const [projectFilter, setProjectFilter] =
    useState("all");

  const [dueDateFilter, setDueDateFilter] =
    useState<DueDateFilter>("all");

  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  const [
    statusUpdatingIds,
    setStatusUpdatingIds,
  ] = useState<Set<string>>(
    () => new Set()
  );

  const [editingTask, setEditingTask] =
    useState<MyTaskItem | null>(null);

  const [editForm, setEditForm] =
    useState<EditTaskForm>(
      emptyEditForm
    );

  const [editSaving, setEditSaving] =
    useState(false);

  const [
    taskPendingDelete,
    setTaskPendingDelete,
  ] = useState<MyTaskItem | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  useEffect(() => {
    void loadTasks();
  }, []);

  useEffect(() => {
    const modalOpen =
      editingTask !== null ||
      taskPendingDelete !== null;

    if (!modalOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key !== "Escape") {
        return;
      }

      if (!editSaving) {
        setEditingTask(null);
      }

      if (!deleteLoading) {
        setTaskPendingDelete(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    editingTask,
    taskPendingDelete,
    editSaving,
    deleteLoading,
  ]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyTasks();

      setTasks(data);
    } catch (error) {
      console.error(
        "Tasks could not be loaded:",
        error
      );

      setTasks([]);

      setError(
        getApiErrorMessage(
          error,
          "Tasks could not be loaded."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const projects = useMemo(() => {
    const projectMap =
      new Map<string, string>();

    tasks.forEach((task) => {
      projectMap.set(
        task.projectId,
        task.projectName
      );
    });

    return Array.from(
      projectMap.entries()
    )
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((first, second) =>
        first.name.localeCompare(
          second.name
        )
      );
  }, [tasks]);

  const statistics = useMemo(() => {
    return {
      total: tasks.length,

      todo: tasks.filter(
        (task) => task.status === 0
      ).length,

      inProgress: tasks.filter(
        (task) => task.status === 1
      ).length,

      completed: tasks.filter(
        (task) => task.status === 2
      ).length,

      overdue: tasks.filter(
        isTaskOverdue
      ).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery =
      searchQuery
        .trim()
        .toLocaleLowerCase("tr-TR");

    const result = tasks.filter(
      (task) => {
        const matchesSearch =
          !normalizedQuery ||
          task.title
            .toLocaleLowerCase("tr-TR")
            .includes(normalizedQuery) ||
          task.description
            .toLocaleLowerCase("tr-TR")
            .includes(normalizedQuery) ||
          task.projectName
            .toLocaleLowerCase("tr-TR")
            .includes(normalizedQuery);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "todo" &&
            task.status === 0) ||
          (statusFilter ===
            "inProgress" &&
            task.status === 1) ||
          (statusFilter ===
            "completed" &&
            task.status === 2);

        const matchesPriority =
          priorityFilter === "all" ||
          (priorityFilter === "low" &&
            task.priority === 0) ||
          (priorityFilter === "medium" &&
            task.priority === 1) ||
          (priorityFilter === "high" &&
            task.priority === 2);

        const matchesProject =
          projectFilter === "all" ||
          task.projectId ===
            projectFilter;

        const matchesDueDate =
          matchDueDateFilter(
            task,
            dueDateFilter
          );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesProject &&
          matchesDueDate
        );
      }
    );

    return [...result].sort(
      (first, second) =>
        compareTasks(
          first,
          second,
          sortOption
        )
    );
  }, [
    tasks,
    searchQuery,
    statusFilter,
    priorityFilter,
    projectFilter,
    dueDateFilter,
    sortOption,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    projectFilter !== "all" ||
    dueDateFilter !== "all" ||
    sortOption !== "newest";

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
    setDueDateFilter("all");
    setSortOption("newest");
  }

  function openProject(
    task: MyTaskItem
  ) {
    navigate(
      `/projects/${task.projectId}`
    );
  }

  function openEditModal(
    task: MyTaskItem
  ) {
    setEditingTask(task);

    setEditForm({
      title: task.title,
      description:
        task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: toDateInputValue(
        task.dueDate
      ),
    });
  }

  async function handleQuickStatusChange(
    task: MyTaskItem,
    newStatus: number
  ) {
    if (
      task.status === newStatus ||
      statusUpdatingIds.has(task.id)
    ) {
      return;
    }

    const previousTask = task;

    setStatusUpdatingIds(
      (current) => {
        const next = new Set(current);
        next.add(task.id);
        return next;
      }
    );

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? applyTaskStatus(
              item,
              newStatus
            )
          : item
      )
    );

    try {
      await updateTask(task.id, {
        title: task.title,
        description:
          task.description ?? "",
        status: newStatus,
        priority: task.priority,
        dueDate:
          task.dueDate ?? null,
      });

      toast.success(
        "Task status updated."
      );
    } catch (error) {
      console.error(
        "Task status update failed:",
        error
      );

      setTasks((current) =>
        current.map((item) =>
          item.id === previousTask.id
            ? previousTask
            : item
        )
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Task status could not be updated."
        )
      );
    } finally {
      setStatusUpdatingIds(
        (current) => {
          const next = new Set(current);
          next.delete(task.id);
          return next;
        }
      );
    }
  }

  async function handleEditSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingTask) {
      return;
    }

    const normalizedTitle =
      editForm.title.trim();

    if (normalizedTitle.length < 2) {
      toast.error(
        "Task title must be at least 2 characters."
      );

      return;
    }

    try {
      setEditSaving(true);

      const dueDate =
        editForm.dueDate
          ? `${editForm.dueDate}T00:00:00`
          : null;

      await updateTask(
        editingTask.id,
        {
          title: normalizedTitle,
          description:
            editForm.description.trim(),
          status: editForm.status,
          priority: editForm.priority,
          dueDate,
        }
      );

      const updatedTask: MyTaskItem = {
        ...editingTask,
        title: normalizedTitle,
        description:
          editForm.description.trim(),
        status: editForm.status,
        priority: editForm.priority,
        dueDate,
        completedAt:
          editForm.status === 2
            ? editingTask.completedAt ??
              new Date().toISOString()
            : null,
      };

      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );

      setEditingTask(null);

      toast.success(
        "Task updated successfully."
      );
    } catch (error) {
      console.error(
        "Task update failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Task could not be updated."
        )
      );
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!taskPendingDelete) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteTask(
        taskPendingDelete.id
      );

      setTasks((current) =>
        current.filter(
          (task) =>
            task.id !==
            taskPendingDelete.id
        )
      );

      setTaskPendingDelete(null);

      toast.success(
        "Task deleted successfully."
      );
    } catch (error) {
      console.error(
        "Task deletion failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Task could not be deleted."
        )
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-400">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            All Tasks
          </h1>

          <p className="mt-2 text-slate-400">
            View and manage tasks across all
            your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadTasks()
          }
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Tasks"
          value={statistics.total}
          icon={ListTodo}
          iconClass="bg-blue-500/10 text-blue-400"
        />

        <SummaryCard
          title="To Do"
          value={statistics.todo}
          icon={Circle}
          iconClass="bg-slate-700/60 text-slate-300"
        />

        <SummaryCard
          title="In Progress"
          value={statistics.inProgress}
          icon={Timer}
          iconClass="bg-amber-500/10 text-amber-400"
        />

        <SummaryCard
          title="Completed"
          value={statistics.completed}
          icon={CheckCircle2}
          iconClass="bg-emerald-500/10 text-emerald-400"
        />

        <SummaryCard
          title="Overdue"
          value={statistics.overdue}
          icon={AlertTriangle}
          iconClass="bg-red-500/10 text-red-400"
        />
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
            <ListFilter size={20} />
          </div>

          <div>
            <h2 className="font-semibold">
              Filters
            </h2>

            <p className="text-sm text-slate-500">
              Narrow down the task list.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search tasks or projects..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(
                value as StatusFilter
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="todo">
              To Do
            </option>

            <option value="inProgress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>
          </FilterSelect>

          <FilterSelect
            value={priorityFilter}
            onChange={(value) =>
              setPriorityFilter(
                value as PriorityFilter
              )
            }
          >
            <option value="all">
              All priorities
            </option>

            <option value="low">
              Low priority
            </option>

            <option value="medium">
              Medium priority
            </option>

            <option value="high">
              High priority
            </option>
          </FilterSelect>

          <FilterSelect
            value={projectFilter}
            onChange={
              setProjectFilter
            }
          >
            <option value="all">
              All projects
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={dueDateFilter}
            onChange={(value) =>
              setDueDateFilter(
                value as DueDateFilter
              )
            }
          >
            <option value="all">
              All due dates
            </option>

            <option value="overdue">
              Overdue
            </option>

            <option value="today">
              Due today
            </option>

            <option value="next7Days">
              Next 7 days
            </option>

            <option value="noDueDate">
              No due date
            </option>
          </FilterSelect>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredTasks.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {tasks.length}
            </span>{" "}
            tasks
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={sortOption}
              onChange={(value) =>
                setSortOption(
                  value as SortOption
                )
              }
              compact
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="dueDate">
                Due date
              </option>

              <option value="priority">
                Highest priority
              </option>
            </FilterSelect>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() =>
              void loadTasks()
            }
          />
        ) : tasks.length === 0 ? (
          <EmptyTasksState
            onOpenProjects={() =>
              navigate("/projects")
            }
          />
        ) : filteredTasks.length === 0 ? (
          <NoResultsState
            onClear={clearFilters}
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(
              (task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  statusUpdating={
                    statusUpdatingIds.has(
                      task.id
                    )
                  }
                  onOpenProject={() =>
                    openProject(task)
                  }
                  onEdit={() =>
                    openEditModal(task)
                  }
                  onDelete={() =>
                    setTaskPendingDelete(
                      task
                    )
                  }
                  onStatusChange={(
                    newStatus
                  ) =>
                    void handleQuickStatusChange(
                      task,
                      newStatus
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          form={editForm}
          saving={editSaving}
          onFormChange={setEditForm}
          onClose={() =>
            setEditingTask(null)
          }
          onSubmit={
            handleEditSubmit
          }
        />
      )}

      {taskPendingDelete && (
        <DeleteTaskModal
          task={taskPendingDelete}
          loading={deleteLoading}
          onClose={() =>
            setTaskPendingDelete(
              null
            )
          }
          onConfirm={() =>
            void handleDeleteConfirm()
          }
        />
      )}
    </DashboardLayout>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  icon: typeof ListTodo;
  iconClass: string;
};

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

type TaskRowProps = {
  task: MyTaskItem;
  statusUpdating: boolean;
  onOpenProject: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (
    status: number
  ) => void;
};

function TaskRow({
  task,
  statusUpdating,
  onOpenProject,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskRowProps) {
  const overdue = isTaskOverdue(task);

  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-800/70">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className={`mt-0.5 rounded-xl p-3 ${getStatusIconClass(
              task.status
            )}`}
          >
            {getStatusIcon(task.status)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenProject}
                className="break-words text-left font-semibold text-white transition hover:text-blue-400"
              >
                {task.title}
              </button>

              <StatusBadge
                status={task.status}
              />

              <PriorityBadge
                priority={task.priority}
              />

              {overdue && (
                <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                  Overdue
                </span>
              )}
            </div>

            {task.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                {task.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={onOpenProject}
                className="flex items-center gap-1.5 transition hover:text-blue-400"
              >
                <FolderKanban
                  size={14}
                />

                {task.projectName}
              </button>

              <span className="flex items-center gap-1.5">
                <CalendarClock
                  size={14}
                />

                {task.dueDate
                  ? formatDate(
                      task.dueDate
                    )
                  : "No due date"}
              </span>

              <span>
                Created{" "}
                {formatDate(
                  task.createdAt
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            {statusUpdating && (
              <LoaderCircle
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 animate-spin text-blue-400"
                size={16}
              />
            )}

            <select
              value={task.status}
              disabled={statusUpdating}
              onChange={(event) =>
                onStatusChange(
                  Number(
                    event.target.value
                  )
                )
              }
              aria-label={`Change status for ${task.title}`}
              className={`rounded-xl border border-slate-700 bg-slate-950 py-2.5 pr-9 text-sm text-slate-300 outline-none transition focus:border-blue-500 disabled:cursor-wait disabled:opacity-60 ${
                statusUpdating
                  ? "pl-9"
                  : "pl-3"
              }`}
            >
              <option value={0}>
                To Do
              </option>

              <option value={1}>
                In Progress
              </option>

              <option value={2}>
                Completed
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            aria-label={`Edit ${task.title}`}
            title="Edit task"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <Trash2 size={17} />
          </button>

          <button
            type="button"
            onClick={onOpenProject}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:text-blue-400"
          >
            Open Project
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

type EditTaskModalProps = {
  task: MyTaskItem;
  form: EditTaskForm;
  saving: boolean;
  onFormChange: (
    form: EditTaskForm
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};

function EditTaskModal({
  task,
  form,
  saving,
  onFormChange,
  onClose,
  onSubmit,
}: EditTaskModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-400">
              {task.projectName}
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              Edit Task
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close edit task modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <FormField label="Task title">
            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              maxLength={150}
              required
              autoFocus
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              placeholder="Task title"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              rows={5}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              placeholder="Task description"
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    status: Number(
                      event.target.value
                    ),
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-blue-500"
              >
                <option value={0}>
                  To Do
                </option>

                <option value={1}>
                  In Progress
                </option>

                <option value={2}>
                  Completed
                </option>
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                value={form.priority}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    priority: Number(
                      event.target.value
                    ),
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-blue-500"
              >
                <option value={0}>
                  Low
                </option>

                <option value={1}>
                  Medium
                </option>

                <option value={2}>
                  High
                </option>
              </select>
            </FormField>
          </div>

          <FormField label="Due date">
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  dueDate:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-blue-500"
            />
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle
                className="animate-spin"
                size={18}
              />
            ) : (
              <Save size={18} />
            )}

            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

type DeleteTaskModalProps = {
  task: MyTaskItem;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteTaskModal({
  task,
  loading,
  onClose,
  onConfirm,
}: DeleteTaskModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <Trash2 size={22} />
        </div>

        <h2
          id="delete-task-title"
          className="mt-5 text-xl font-semibold text-white"
        >
          Delete Task
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {task.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle
                className="animate-spin"
                size={18}
              />
            ) : (
              <Trash2 size={18} />
            )}

            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function StatusBadge({
  status,
}: {
  status: number;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
        status
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: number;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
        priority
      )}`}
    >
      {getPriorityText(priority)}
    </span>
  );
}

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  compact?: boolean;
};

function FilterSelect({
  value,
  onChange,
  children,
  compact = false,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={`rounded-xl border border-slate-700 bg-slate-950 text-sm text-slate-300 outline-none transition focus:border-blue-500 ${
        compact
          ? "px-3 py-2"
          : "w-full px-4 py-3"
      }`}
    >
      {children}
    </select>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
      <div className="text-center">
        <LoaderCircle
          className="mx-auto animate-spin text-blue-400"
          size={36}
        />

        <p className="mt-4 text-slate-400">
          Loading tasks...
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
      <div className="text-center">
        <TriangleAlert
          className="mx-auto text-red-400"
          size={38}
        />

        <h2 className="mt-4 text-lg font-semibold">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function EmptyTasksState({
  onOpenProjects,
}: {
  onOpenProjects: () => void;
}) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-8">
      <div className="max-w-sm text-center">
        <ListTodo
          className="mx-auto text-slate-600"
          size={42}
        />

        <h2 className="mt-4 text-xl font-semibold">
          No tasks yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Open one of your projects and create
          your first task.
        </p>

        <button
          type="button"
          onClick={onOpenProjects}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          View Projects
        </button>
      </div>
    </div>
  );
}

function NoResultsState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-8">
      <div className="text-center">
        <Search
          className="mx-auto text-slate-600"
          size={40}
        />

        <h2 className="mt-4 text-lg font-semibold">
          No matching tasks
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Try changing or clearing the
          selected filters.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

function getStatusIcon(
  status: number
) {
  switch (status) {
    case 0:
      return <Circle size={20} />;

    case 1:
      return <Timer size={20} />;

    case 2:
      return (
        <CheckCircle2 size={20} />
      );

    default:
      return <Circle size={20} />;
  }
}

function getStatusIconClass(
  status: number
): string {
  switch (status) {
    case 0:
      return "bg-slate-700/60 text-slate-300";

    case 1:
      return "bg-amber-500/10 text-amber-400";

    case 2:
      return "bg-emerald-500/10 text-emerald-400";

    default:
      return "bg-slate-700/60 text-slate-300";
  }
}

function getStatusText(
  status: number
): string {
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

function getStatusBadgeClass(
  status: number
): string {
  switch (status) {
    case 0:
      return "bg-slate-700 text-slate-300";

    case 1:
      return "bg-amber-500/10 text-amber-400";

    case 2:
      return "bg-emerald-500/10 text-emerald-400";

    default:
      return "bg-slate-700 text-slate-300";
  }
}

function getPriorityText(
  priority: number
): string {
  switch (priority) {
    case 0:
      return "Low";

    case 1:
      return "Medium";

    case 2:
      return "High";

    default:
      return "Unknown";
  }
}

function getPriorityClass(
  priority: number
): string {
  switch (priority) {
    case 0:
      return "bg-emerald-500/10 text-emerald-400";

    case 1:
      return "bg-blue-500/10 text-blue-400";

    case 2:
      return "bg-red-500/10 text-red-400";

    default:
      return "bg-slate-700 text-slate-300";
  }
}

function isTaskOverdue(
  task: MyTaskItem
): boolean {
  if (
    !task.dueDate ||
    task.status === 2
  ) {
    return false;
  }

  const dueDate =
    startOfDay(
      new Date(task.dueDate)
    );

  const today =
    startOfDay(new Date());

  return dueDate < today;
}

function matchDueDateFilter(
  task: MyTaskItem,
  filter: DueDateFilter
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "noDueDate") {
    return !task.dueDate;
  }

  if (!task.dueDate) {
    return false;
  }

  const today =
    startOfDay(new Date());

  const dueDate =
    startOfDay(
      new Date(task.dueDate)
    );

  if (filter === "overdue") {
    return (
      task.status !== 2 &&
      dueDate < today
    );
  }

  if (filter === "today") {
    return (
      dueDate.getTime() ===
      today.getTime()
    );
  }

  if (filter === "next7Days") {
    const finalDate =
      new Date(today);

    finalDate.setDate(
      finalDate.getDate() + 7
    );

    return (
      dueDate >= today &&
      dueDate <= finalDate
    );
  }

  return true;
}

function compareTasks(
  first: MyTaskItem,
  second: MyTaskItem,
  sortOption: SortOption
): number {
  switch (sortOption) {
    case "oldest":
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );

    case "dueDate": {
      if (
        !first.dueDate &&
        !second.dueDate
      ) {
        return 0;
      }

      if (!first.dueDate) {
        return 1;
      }

      if (!second.dueDate) {
        return -1;
      }

      return (
        new Date(first.dueDate).getTime() -
        new Date(second.dueDate).getTime()
      );
    }

    case "priority":
      return (
        second.priority -
        first.priority
      );

    case "newest":
    default:
      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
  }
}

function applyTaskStatus(
  task: MyTaskItem,
  newStatus: number
): MyTaskItem {
  return {
    ...task,
    status: newStatus,
    completedAt:
      newStatus === 2
        ? task.completedAt ??
          new Date().toISOString()
        : null,
  };
}

function toDateInputValue(
  dateValue?: string | null
): string {
  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(
  date: Date
): Date {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

function formatDate(
  dateValue: string
): string {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data =
    error.response?.data as
      | {
          message?: string;
          title?: string;
          errors?: Record<
            string,
            string[]
          >;
        }
      | undefined;

  if (data?.message) {
    return data.message;
  }

  if (data?.errors) {
    const validationMessage =
      Object.values(data.errors)
        .flat()
        .find(Boolean);

    if (validationMessage) {
      return validationMessage;
    }
  }

  if (data?.title) {
    return data.title;
  }

  return fallback;
}