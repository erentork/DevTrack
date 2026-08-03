import api from "../api/axios";
import type { Project } from "../types/project";

type PagedProjectResponse = {
  items?: Project[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};

export type CreateProjectRequest = {
  name: string;
  description: string;
};

export type UpdateProjectRequest = {
  name: string;
  description: string;
};

export async function getMyProjects(): Promise<Project[]> {
  const response = await api.get<Project[] | PagedProjectResponse>(
    "/Projects"
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.items)) {
    return response.data.items;
  }

  return [];
}

export async function getProjectById(
  projectId: string
): Promise<Project> {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await api.get<Project>(
    `/Projects/${projectId}`
  );

  console.log("Project Detail API Response:", response.data);

  return response.data;
}

export async function createProject(
  data: CreateProjectRequest
): Promise<Project> {
  const response = await api.post<Project>(
    "/Projects",
    data
  );

  return response.data;
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<Project> {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await api.put<Project>(
    `/Projects/${projectId}`,
    data
  );

  return response.data;
}

export async function deleteProject(
  projectId: string
): Promise<void> {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  await api.delete(`/Projects/${projectId}`);
}