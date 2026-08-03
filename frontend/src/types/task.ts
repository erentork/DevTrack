export type TaskItem = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type MyTaskItem = TaskItem & {
  projectName: string;
  completedAt?: string | null;
};