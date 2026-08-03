import {
  useState,
  type FormEvent,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  login,
} from "../services/authService";

type LoginLocationState = {
  registeredEmail?: string;

  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as
      | LoginLocationState
      | null;

  const {
    signIn,
  } = useAuth();

  const [email, setEmail] =
    useState(
      locationState
        ?.registeredEmail ?? ""
    );

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      toast.error(
        "Email address is required."
      );

      return;
    }

    if (!password) {
      toast.error(
        "Password is required."
      );

      return;
    }

    try {
      setSubmitting(true);

      const result =
        await login({
          email: normalizedEmail,
          password,
        });

      const token =
        result.token ??
        result.accessToken ??
        result.data?.token ??
        result.data?.accessToken;

      if (!token) {
        throw new Error(
          "Login response did not contain a token."
        );
      }

      await signIn(token);

      const previousLocation =
        locationState?.from;

      const destination =
        previousLocation?.pathname
          ? `${previousLocation.pathname}${previousLocation.search ?? ""}${previousLocation.hash ?? ""}`
          : "/dashboard";

      toast.success(
        "Welcome back!"
      );

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Email or password is incorrect."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-5xl font-bold text-transparent">
            DevTrack
          </h1>

          <p className="mt-3 text-slate-400">
            Project Management Platform
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl shadow-black/30"
        >
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Sign In
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Enter your account details
              to continue.
            </p>
          </div>

          <div className="mt-7">
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="example@mail.com"
                required
                disabled={submitting}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="********"
                required
                disabled={submitting}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={submitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <LoaderCircle
                className="animate-spin"
                size={19}
              />
            )}

            {submitting
              ? "Signing In..."
              : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data =
    error.response?.data as
      | {
          message?: string;
          title?: string;
          errors?: Record<
            string,
            string[]
          >;
        }
      | undefined;

  if (data?.message) {
    return data.message;
  }

  if (data?.errors) {
    const validationMessage =
      Object.values(data.errors)
        .flat()
        .find(Boolean);

    if (validationMessage) {
      return validationMessage;
    }
  }

  if (data?.title) {
    return data.title;
  }

  return fallback;
}