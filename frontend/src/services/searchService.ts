import api from "../api/axios";

import type {
  GlobalSearchResponse,
} from "../types/search";

export async function globalSearch(
  query: string,
  signal?: AbortSignal
): Promise<GlobalSearchResponse> {
  const response =
    await api.get<GlobalSearchResponse>(
      "/Search",
      {
        params: {
          query,
        },
        signal,
      }
    );

  return response.data;
}