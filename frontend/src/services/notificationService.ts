import api from "../api/axios";

import type {
  NotificationResponse,
} from "../types/notification";

export async function getNotifications(): Promise<NotificationResponse> {
  const response =
    await api.get<NotificationResponse>(
      "/Notifications"
    );

  return response.data;
}