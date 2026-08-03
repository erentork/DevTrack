import api from "../api/axios";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  expireAt?: string;

  data?: {
    token?: string;
    accessToken?: string;
    expireAt?: string;
  };
};

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  const response =
    await api.post<LoginResponse>(
      "/Auth/login",
      request
    );

  return response.data;
}

export async function register(
  request: RegisterRequest
): Promise<void> {
  await api.post(
    "/Users/register",
    request
  );
}