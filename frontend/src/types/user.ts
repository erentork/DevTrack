export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarKey: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}