export interface RecentDashboardTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  status: number;
  priority: number;
  dueDate?: string | null;
  createdAt: string;
}

export interface RecentDashboardProject {
  id: string;
  name: string;
  description?: string | null;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
}

export interface Dashboard {
  projectCount: number;
  taskCount: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  recentTasks: RecentDashboardTask[];
  recentProjects: RecentDashboardProject[];

  
}

export interface DailyTaskStat {
  date: string;
  createdTasks: number;
  completedTasks: number;
}

export interface Dashboard {
  projectCount: number;
  taskCount: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  recentTasks: RecentDashboardTask[];
  recentProjects: RecentDashboardProject[];
  dailyTaskStats: DailyTaskStat[];
}