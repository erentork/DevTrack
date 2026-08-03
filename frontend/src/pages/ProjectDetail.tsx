import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  GripVertical,
  ListTodo,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import {
  CSS,
} from "@dnd-kit/utilities";

import DashboardLayout from "../layouts/DashboardLayout";

import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";

import {
  deleteProject,
  getProjectById,
} from "../services/projectService";

import {
  deleteTask,
  getTasksByProject,
  updateTaskStatus,
} from "../services/taskService";

import type {
  Project,
} from "../types/project";

import type {
  TaskItem,
} from "../types/task";

type StatusFilter = "all" | "0" | "1" | "2";
type PriorityFilter = "all" | "0" | "1" | "2" | "3";
type DueDateFilter =
  | "all"
  | "overdue"
  | "dueSoon"
  | "noDueDate";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] =
    useState<TaskItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [projectError, setProjectError] =
    useState("");

  const [taskError, setTaskError] =
    useState("");

  const [taskModalOpen, setTaskModalOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<TaskItem | null>(null);

  const [activeTask, setActiveTask] =
    useState<TaskItem | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  const [deletingTaskId, setDeletingTaskId] =
    useState<string | null>(null);

  const [deletingProject, setDeletingProject] =
    useState(false);

  const [updatingTaskId, setUpdatingTaskId] =
    useState<string | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");

  const [dueDateFilter, setDueDateFilter] =
    useState<DueDateFilter>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProjectDetail() {
      setLoading(true);
      setProjectError("");
      setTaskError("");
      setProject(null);
      setTasks([]);

      if (!id) {
        setProjectError(
          "Project ID could not be found."
        );

        setLoading(false);

        return;
      }

      try {
        const projectData =
          await getProjectById(id);

        if (!isMounted) {
          return;
        }

        if (!projectData) {
          setProjectError(
            "No project found."
          );

          setLoading(false);

          return;
        }

        setProject(projectData);
      } catch (error) {
        console.error(
          "Project could not be loaded:",
          error
        );

        if (!isMounted) {
          return;
        }

        setProjectError(
          "Project details could not be loaded."
        );

        setLoading(false);

        return;
      }

      try {
        const taskData =
          await getTasksByProject(id);

        if (!isMounted) {
          return;
        }

        setTasks(
          Array.isArray(taskData)
            ? taskData
            : []
        );
      } catch (error) {
        console.error(
          "Tasks could not be loaded:",
          error
        );

        if (!isMounted) {
          return;
        }

        setTasks([]);

        setTaskError(
          "Project loaded, but its tasks could not be retrieved."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProjectDetail();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const allTodoTasks = tasks.filter(
    (task) => task.status === 0
  );

  const allInProgressTasks = tasks.filter(
    (task) => task.status === 1
  );

  const allCompletedTasks = tasks.filter(
    (task) => task.status === 2
  );

  const normalizedSearch = searchTerm
    .trim()
    .toLocaleLowerCase("tr-TR");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      task.title
        .toLocaleLowerCase("tr-TR")
        .includes(normalizedSearch) ||
      (task.description ?? "")
        .toLocaleLowerCase("tr-TR")
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      task.status === Number(statusFilter);

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority === Number(priorityFilter);

    const matchesDueDate =
      dueDateFilter === "all" ||
      (dueDateFilter === "overdue" &&
        isTaskOverdue(task)) ||
      (dueDateFilter === "dueSoon" &&
        isTaskDueSoon(task)) ||
      (dueDateFilter === "noDueDate" &&
        !task.dueDate);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesDueDate
    );
  });

  const todoTasks = filteredTasks.filter(
    (task) => task.status === 0
  );

  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === 1
  );

  const completedTasks = filteredTasks.filter(
    (task) => task.status === 2
  );

  const hasActiveFilters =
    normalizedSearch.length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    dueDateFilter !== "all";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setDueDateFilter("all");
  }

  function refreshTasks() {
    setReloadKey(
      (currentValue) => currentValue + 1
    );
  }

  async function handleDeleteProject() {
    if (!id || deletingProject) {
      return;
    }

    const confirmed = window.confirm(
      'Delete "' +
        (project?.name ?? "this project") +
        '"? All tasks in this project will also be deleted. This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProject(true);

      await deleteProject(id);

      toast.success(
        "Project deleted successfully."
      );

      navigate("/projects", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Project delete failed:",
        error
      );

      toast.error(
        "Project could not be deleted."
      );

      setDeletingProject(false);
    }
  }

  async function handleDeleteTask(
    task: TaskItem
  ) {
    const confirmed = window.confirm(
      `"${task.title}" görevini silmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(task.id);

      await deleteTask(task.id);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (currentTask) =>
            currentTask.id !== task.id
        )
      );

      toast.success(
        "Task deleted successfully."
      );
    } catch (error) {
      console.error(
        "Task delete failed:",
        error
      );

      toast.error(
        "Task could not be deleted."
      );
    } finally {
      setDeletingTaskId(null);
    }
  }

  async function handleStatusChange(
    task: TaskItem,
    newStatus: number
  ) {
    if (
      task.status === newStatus ||
      updatingTaskId === task.id
    ) {
      return;
    }

    const oldStatus = task.status;

    // Optimistic update:
    // Kart arayüzde beklemeden yeni sütuna geçer.
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              status: newStatus,
            }
          : currentTask
      )
    );

    try {
      setUpdatingTaskId(task.id);

      await updateTaskStatus(
        task,
        newStatus
      );

      toast.success(
        "Task status updated."
      );
    } catch (error) {
      console.error(
        "Task status update failed:",
        error
      );

      // Backend hatası olursa eski sütuna geri al.
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? {
                ...currentTask,
                status: oldStatus,
              }
            : currentTask
        )
      );

      toast.error(
        "Task status could not be updated."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  function handleDragStart(
    event: DragStartEvent
  ) {
    const draggedTask =
      event.active.data.current
        ?.task as TaskItem | undefined;

    if (!draggedTask) {
      return;
    }

    setActiveTask(draggedTask);
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const draggedTask =
      active.data.current
        ?.task as TaskItem | undefined;

    if (!draggedTask) {
      return;
    }

    const newStatus =
      Number(over.id);

    if (
      !Number.isInteger(newStatus) ||
      ![0, 1, 2].includes(newStatus)
    ) {
      return;
    }

    void handleStatusChange(
      draggedTask,
      newStatus
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

            <p className="mt-4 text-slate-400">
              Loading project...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (projectError || !project) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
          <h1 className="text-2xl font-semibold text-red-400">
            Project could not be loaded
          </h1>

          <p className="mt-3 text-slate-400">
            {projectError ||
              "Project not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/projects")
            }
            className="mt-6 rounded-xl bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <button
        type="button"
        onClick={() =>
          navigate("/projects")
        }
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />

        Back to Projects
      </button>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-blue-600/20 p-4 text-blue-400">
              <FolderKanban size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {project.name}
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                {project.description ||
                  "No description was added."}
              </p>

              {project.createdAt && (
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />

                  <span>
                    Created{" "}
                    {formatDate(
                      project.createdAt
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDeleteProject}
              disabled={deletingProject}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:border-red-500/60 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={18} />
              {deletingProject
                ? "Deleting..."
                : "Delete Project"}
            </button>

            <button
              type="button"
              onClick={() =>
                setTaskModalOpen(true)
              }
              disabled={deletingProject}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              New Task
            </button>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          title="Total Tasks"
          value={tasks.length}
          icon={
            <ListTodo size={23} />
          }
        />

        <StatBox
          title="To Do"
          value={allTodoTasks.length}
          icon={
            <Circle size={23} />
          }
        />

        <StatBox
          title="In Progress"
          value={allInProgressTasks.length}
          icon={
            <Clock3 size={23} />
          }
        />

        <StatBox
          title="Completed"
          value={allCompletedTasks.length}
          icon={
            <CheckCircle2 size={23} />
          }
        />
      </section>

      <section className="mt-7 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/15 p-3 text-blue-400">
              <SlidersHorizontal size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Search and Filters
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {filteredTasks.length} of {tasks.length} tasks shown
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white sm:self-auto"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(160px,1fr))]">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-500">
              Search
            </span>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search title or description..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </label>

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as StatusFilter)
            }
            options={[
              { value: "all", label: "All statuses" },
              { value: "0", label: "To Do" },
              { value: "1", label: "In Progress" },
              { value: "2", label: "Completed" },
            ]}
          />

          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={(value) =>
              setPriorityFilter(value as PriorityFilter)
            }
            options={[
              { value: "all", label: "All priorities" },
              { value: "0", label: "Low" },
              { value: "1", label: "Medium" },
              { value: "2", label: "High" },
              { value: "3", label: "Critical" },
            ]}
          />

          <FilterSelect
            label="Due Date"
            value={dueDateFilter}
            onChange={(value) =>
              setDueDateFilter(value as DueDateFilter)
            }
            options={[
              { value: "all", label: "All due dates" },
              { value: "overdue", label: "Overdue" },
              { value: "dueSoon", label: "Due within 7 days" },
              { value: "noDueDate", label: "No due date" },
            ]}
          />
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Kanban Board
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Drag tasks between columns to
              update their status.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <GripVertical size={15} />

            Drag using the task handle
          </div>
        </div>

        {taskError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <TriangleAlert
              size={20}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <p className="font-medium text-amber-400">
                Tasks could not be loaded
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {taskError}
              </p>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-6 py-14 text-center">
            <ListTodo
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold text-white">
              No tasks yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create the first task for this
              project.
            </p>

            <button
              type="button"
              onClick={() =>
                setTaskModalOpen(true)
              }
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Create Task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-6 py-14 text-center">
            <Search
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold text-white">
              No matching tasks
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Try changing your search term or filters to see more tasks.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={
              closestCorners
            }
            onDragStart={
              handleDragStart
            }
            onDragCancel={
              handleDragCancel
            }
            onDragEnd={
              handleDragEnd
            }
          >
            <div className="grid items-start gap-5 xl:grid-cols-3">
              <KanbanColumn
                title="To Do"
                description="Tasks waiting to be started."
                tasks={todoTasks}
                status={0}
                icon={
                  <Circle size={19} />
                }
                deletingTaskId={
                  deletingTaskId
                }
                updatingTaskId={
                  updatingTaskId
                }
                onEdit={
                  setSelectedTask
                }
                onDelete={
                  handleDeleteTask
                }
                onStatusChange={
                  handleStatusChange
                }
              />

              <KanbanColumn
                title="In Progress"
                description="Tasks currently being worked on."
                tasks={inProgressTasks}
                status={1}
                icon={
                  <Clock3 size={19} />
                }
                deletingTaskId={
                  deletingTaskId
                }
                updatingTaskId={
                  updatingTaskId
                }
                onEdit={
                  setSelectedTask
                }
                onDelete={
                  handleDeleteTask
                }
                onStatusChange={
                  handleStatusChange
                }
              />

              <KanbanColumn
                title="Completed"
                description="Tasks that have been finished."
                tasks={completedTasks}
                status={2}
                icon={
                  <CheckCircle2
                    size={19}
                  />
                }
                deletingTaskId={
                  deletingTaskId
                }
                updatingTaskId={
                  updatingTaskId
                }
                onEdit={
                  setSelectedTask
                }
                onDelete={
                  handleDeleteTask
                }
                onStatusChange={
                  handleStatusChange
                }
              />
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCardPreview
                  task={activeTask}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </section>

      {taskModalOpen && id && (
        <CreateTaskModal
          projectId={id}
          onClose={() =>
            setTaskModalOpen(false)
          }
          onCreated={() => {
            setTaskModalOpen(false);
            refreshTasks();
          }}
        />
      )}

      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() =>
            setSelectedTask(null)
          }
          onUpdated={() => {
            setSelectedTask(null);
            refreshTasks();
          }}
        />
      )}
    </DashboardLayout>
  );
}

type FilterOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type StatBoxProps = {
  title: string;
  value: number;
  icon: ReactNode;
};

function StatBox({
  title,
  value,
  icon,
}: StatBoxProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-600/15 p-3 text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

type KanbanColumnProps = {
  title: string;
  description: string;
  tasks: TaskItem[];
  status: number;
  icon: ReactNode;
  deletingTaskId: string | null;
  updatingTaskId: string | null;
  onEdit: (
    task: TaskItem
  ) => void;
  onDelete: (
    task: TaskItem
  ) => Promise<void>;
  onStatusChange: (
    task: TaskItem,
    status: number
  ) => Promise<void>;
};

function KanbanColumn({
  title,
  description,
  tasks,
  status,
  icon,
  deletingTaskId,
  updatingTaskId,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 rounded-2xl border p-4 transition ${
        isOver
          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5"
          : "border-slate-800 bg-slate-900"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div
            className={
              getColumnIconClass(status)
            }
          >
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div
          className={`rounded-xl border border-dashed px-4 py-12 text-center transition ${
            isOver
              ? "border-blue-500/60 bg-blue-500/10"
              : "border-slate-700"
          }`}
        >
          <p className="text-sm font-medium text-slate-400">
            {isOver
              ? "Drop task here"
              : "No tasks"}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {isOver
              ? "Release to update its status."
              : "This column is currently empty."}
          </p>
        </div>
      ) : (
        <div className="min-h-24 space-y-4">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              deleting={
                deletingTaskId ===
                task.id
              }
              updating={
                updatingTaskId ===
                task.id
              }
              onEdit={() =>
                onEdit(task)
              }
              onDelete={() =>
                void onDelete(task)
              }
              onStatusChange={(
                newStatus
              ) =>
                void onStatusChange(
                  task,
                  newStatus
                )
              }
            />
          ))}

          {isOver && (
            <div className="rounded-xl border border-dashed border-blue-500/50 bg-blue-500/5 px-4 py-5 text-center text-xs font-medium text-blue-400">
              Drop task here
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type TaskCardProps = {
  task: TaskItem;
  deleting: boolean;
  updating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (
    status: number
  ) => void;
};

function DraggableTaskCard({
  task,
  deleting,
  updating,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      task,
    },
    disabled:
      deleting || updating,
  });

  const style = {
    transform:
      CSS.Translate.toString(
        transform
      ),
  };

  const isOverdue =
    isTaskOverdue(task);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm transition ${
        isDragging
          ? "opacity-30"
          : "hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="break-words font-semibold text-white">
            {task.title}
          </h4>

          <span
            className={`mt-3 inline-flex ${getPriorityClass(
              task.priority
            )}`}
          >
            {getPriorityText(
              task.priority
            )}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            {...listeners}
            {...attributes}
            disabled={
              deleting || updating
            }
            className="cursor-grab touch-none rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
            title="Drag task"
            aria-label={`Drag ${task.title}`}
          >
            <GripVertical
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={onEdit}
            disabled={
              deleting || updating
            }
            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            title="Edit task"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={
              deleting || updating
            }
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            title="Delete task"
          >
            {deleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-red-400" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
        {task.description ||
          "No description"}
      </p>

      {task.dueDate && (
        <div
          className={`mt-4 flex items-center gap-1.5 text-xs ${
            isOverdue
              ? "text-red-400"
              : "text-slate-500"
          }`}
        >
          <CalendarDays size={14} />

          <span>
            {isOverdue
              ? "Overdue"
              : "Due"}{" "}
            {formatDate(
              task.dueDate
            )}
          </span>
        </div>
      )}

      <div className="mt-4 border-t border-slate-800 pt-4">
        <label
          htmlFor={`task-status-${task.id}`}
          className="mb-2 block text-xs font-medium text-slate-500"
        >
          Move task
        </label>

        <select
          id={`task-status-${task.id}`}
          value={task.status}
          disabled={
            updating || deleting
          }
          onChange={(event) =>
            onStatusChange(
              Number(
                event.target.value
              )
            )
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
    </article>
  );
}

function TaskCardPreview({
  task,
}: {
  task: TaskItem;
}) {
  const isOverdue =
    isTaskOverdue(task);

  return (
    <article className="w-[330px] rotate-2 cursor-grabbing rounded-xl border border-blue-500/50 bg-slate-950 p-4 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="break-words font-semibold text-white">
            {task.title}
          </h4>

          <span
            className={`mt-3 inline-flex ${getPriorityClass(
              task.priority
            )}`}
          >
            {getPriorityText(
              task.priority
            )}
          </span>
        </div>

        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          <GripVertical
            size={17}
          />
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
        {task.description ||
          "No description"}
      </p>

      {task.dueDate && (
        <div
          className={`mt-4 flex items-center gap-1.5 text-xs ${
            isOverdue
              ? "text-red-400"
              : "text-slate-500"
          }`}
        >
          <CalendarDays size={14} />

          <span>
            {isOverdue
              ? "Overdue"
              : "Due"}{" "}
            {formatDate(
              task.dueDate
            )}
          </span>
        </div>
      )}
    </article>
  );
}

function isTaskDueSoon(
  task: TaskItem
): boolean {
  if (
    !task.dueDate ||
    task.status === 2
  ) {
    return false;
  }

  const dueDate =
    new Date(task.dueDate);

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return false;
  }

  dueDate.setHours(
    0,
    0,
    0,
    0
  );

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const sevenDaysFromToday =
    new Date(today);

  sevenDaysFromToday.setDate(
    today.getDate() + 7
  );

  return (
    dueDate.getTime() >=
      today.getTime() &&
    dueDate.getTime() <=
      sevenDaysFromToday.getTime()
  );
}

function isTaskOverdue(
  task: TaskItem
): boolean {
  if (
    !task.dueDate ||
    task.status === 2
  ) {
    return false;
  }

  const dueDate =
    new Date(task.dueDate);

  dueDate.setHours(
    0,
    0,
    0,
    0
  );

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return (
    dueDate.getTime() <
    today.getTime()
  );
}

function getColumnIconClass(
  status: number
): string {
  const baseClass =
    "rounded-xl p-2.5";

  switch (status) {
    case 0:
      return `${baseClass} bg-slate-500/10 text-slate-400`;

    case 1:
      return `${baseClass} bg-amber-500/10 text-amber-400`;

    case 2:
      return `${baseClass} bg-emerald-500/10 text-emerald-400`;

    default:
      return `${baseClass} bg-blue-500/10 text-blue-400`;
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

    case 3:
      return "Critical";

    default:
      return "Unknown";
  }
}

function getPriorityClass(
  priority: number
): string {
  const baseClass =
    "rounded-full px-3 py-1 text-xs font-medium";

  switch (priority) {
    case 0:
      return `${baseClass} bg-emerald-500/10 text-emerald-400`;

    case 1:
      return `${baseClass} bg-blue-500/10 text-blue-400`;

    case 2:
      return `${baseClass} bg-amber-500/10 text-amber-400`;

    case 3:
      return `${baseClass} bg-red-500/10 text-red-400`;

    default:
      return `${baseClass} bg-slate-500/10 text-slate-400`;
  }
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

  return date.toLocaleDateString(
    "tr-TR"
  );
}