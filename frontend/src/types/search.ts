export interface SearchProject {
  id: string;
  name: string;
  description?: string | null;
}

export interface SearchTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  status: number;
  priority: number;
}

export interface GlobalSearchResponse {
  projects: SearchProject[];
  tasks: SearchTask[];
}