import api from "../api/axios";

import type {
  MyTaskItem,
  TaskItem,
} from "../types/task";

export type CreateTaskRequest = {
  projectId: string;
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate: string | null;
};

export type UpdateTaskRequest = {
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate: string | null;
};

export type PagedTaskResponse = {
  items: TaskItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
};

export async function getTasksByProject(
  projectId: string
): Promise<TaskItem[]> {
  const response = await api.get<
    TaskItem[] | PagedTaskResponse
  >(`/Tasks/project/${projectId}`);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.items ?? [];
}

export async function getMyTasks():
  Promise<MyTaskItem[]> {
  const response =
    await api.get<MyTaskItem[]>(
      "/Tasks/my"
    );

  return Array.isArray(response.data)
    ? response.data
    : [];
}

export async function createTask(
  request: CreateTaskRequest
): Promise<void> {
  await api.post(
    "/Tasks",
    request
  );
}

export async function updateTask(
  taskId: string,
  request: UpdateTaskRequest
): Promise<void> {
  await api.put(
    `/Tasks/${taskId}`,
    request
  );
}

export async function updateTaskStatus(
  task: TaskItem,
  newStatus: number
): Promise<void> {
  await updateTask(task.id, {
    title: task.title,
    description:
      task.description ?? "",
    status: newStatus,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
  });
}

export async function deleteTask(
  taskId: string
): Promise<void> {
  await api.delete(
    `/Tasks/${taskId}`
  );
}