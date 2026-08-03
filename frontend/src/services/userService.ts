import api from "../api/axios";

import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "../types/user";

export async function getProfile():
  Promise<UserProfile> {
  const response =
    await api.get<UserProfile>(
      "/Users/me"
    );

  return response.data;
}

export async function updateProfile(
  request: UpdateProfileRequest
): Promise<UserProfile> {
  const response =
    await api.put<UserProfile>(
      "/Users/me",
      request
    );

  return response.data;
}

export async function updateAvatar(
  avatarKey: string
): Promise<UserProfile> {
  const response =
    await api.put<UserProfile>(
      "/Users/me/avatar",
      {
        avatarKey,
      }
    );

  return response.data;
}

export async function changePassword(
  request: ChangePasswordRequest
): Promise<void> {
  await api.put(
    "/Users/me/password",
    request
  );
}