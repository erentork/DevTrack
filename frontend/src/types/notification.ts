export interface NotificationItem {
  taskId: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  type: "overdue" | "dueToday" | "dueSoon";
  message: string;
  dueDate: string;
  daysRemaining: number;
}

export interface NotificationResponse {
  totalCount: number;
  items: NotificationItem[];
}