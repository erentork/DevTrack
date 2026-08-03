import api from "../api/axios";
import type { Dashboard } from "../types/dashboard";

export async function getDashboard(): Promise<Dashboard> {
  const response = await api.get<Dashboard>("/Dashboard");
  return response.data;
}