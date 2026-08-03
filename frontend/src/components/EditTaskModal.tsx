import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { updateTask } from "../services/taskService";

import type { TaskItem } from "../types/task";

type Props = {
  task: TaskItem;
  onClose: () => void;
  onUpdated: () => void;
};

function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Task could not be updated.";
  }

  const responseData = error.response?.data;

  console.error("Update task status:", error.response?.status);
  console.error("Update task response:", responseData);
  console.error("Update task request:", error.config?.data);

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.title) {
    return responseData.title;
  }

  if (responseData?.errors) {
    const validationMessages = Object.values(
      responseData.errors
    )
      .flat()
      .filter(
        (message): message is string =>
          typeof message === "string"
      );

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  return "Task could not be updated.";
}

export default function EditTaskModal({
  task,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description ?? ""
  );
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(
      task.dueDate ? task.dueDate.split("T")[0] : ""
    );
    setError("");
  }, [task]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate
          ? new Date(
              `${dueDate}T00:00:00`
            ).toISOString()
          : null,
      });

      toast.success("Task updated successfully.");

      onUpdated();
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Edit Task
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Update task information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="edit-task-title"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Title
            </label>

            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              placeholder="Task title"
              disabled={submitting}
              autoFocus
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-description"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Description
            </label>

            <textarea
              id="edit-task-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Task description"
              rows={4}
              disabled={submitting}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-task-status"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Status
              </label>

              <select
                id="edit-task-status"
                value={status}
                onChange={(event) =>
                  setStatus(Number(event.target.value))
                }
                disabled={submitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value={0}>To Do</option>
                <option value={1}>In Progress</option>
                <option value={2}>Completed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-task-priority"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Priority
              </label>

              <select
                id="edit-task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(Number(event.target.value))
                }
                disabled={submitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
                <option value={3}>Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-task-due-date"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Due Date
            </label>

            <input
              id="edit-task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}