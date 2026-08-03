import axios from "axios";

export const AUTH_UNAUTHORIZED_EVENT =
  "devtrack:unauthorized";

const configuredApiUrl =
  import.meta.env.VITE_API_URL
    ?.trim()
    .replace(/\/+$/, "");

const apiBaseUrl =
  configuredApiUrl ||
  (
    import.meta.env.DEV
      ? "http://127.0.0.1:5175/api"
      : ""
  );

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_URL is not configured."
  );
}

const api = axios.create({
  baseURL: apiBaseUrl,

  headers: {
    "Content-Type":
      "application/json",
  },
});

let lastSessionExpiredEventAt = 0;

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      return config;
    }

    if (isJwtExpired(token)) {
      expireSession();

      return config;
    }

    config.headers.Authorization =
      `Bearer ${token}`;

    return config;
  },

  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      String(
        error.config?.url ?? ""
      ).toLowerCase();

    const token =
      localStorage.getItem("token");

    const isProfileRequest =
      requestUrl.includes(
        "/users/me"
      ) &&
      !requestUrl.includes(
        "/users/me/password"
      );

    const isAuthProfileRequest =
      requestUrl.includes(
        "/auth/me"
      );

    if (
      status === 401 &&
      token &&
      (
        isProfileRequest ||
        isAuthProfileRequest ||
        isJwtExpired(token)
      )
    ) {
      expireSession();
    }

    return Promise.reject(error);
  }
);

function expireSession() {
  const hadToken =
    Boolean(
      localStorage.getItem("token")
    );

  localStorage.removeItem("token");

  if (!hadToken) {
    return;
  }

  const now = Date.now();

  if (
    now -
      lastSessionExpiredEventAt <
    1500
  ) {
    return;
  }

  lastSessionExpiredEventAt = now;

  window.dispatchEvent(
    new CustomEvent(
      AUTH_UNAUTHORIZED_EVENT,
      {
        detail: {
          reason: "expired",
        },
      }
    )
  );
}

function isJwtExpired(
  token: string
): boolean {
  try {
    const tokenParts =
      token.split(".");

    if (tokenParts.length !== 3) {
      return true;
    }

    const payloadValue =
      tokenParts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const paddedPayload =
      payloadValue.padEnd(
        Math.ceil(
          payloadValue.length / 4
        ) * 4,
        "="
      );

    const payload =
      JSON.parse(
        window.atob(
          paddedPayload
        )
      ) as {
        exp?: number;
      };

    if (
      typeof payload.exp !==
      "number"
    ) {
      return true;
    }

    return (
      payload.exp * 1000 <=
      Date.now()
    );
  } catch {
    return true;
  }
}

export default api;
