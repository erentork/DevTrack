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
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  register,
} from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedUsername =
      username.trim();

    const normalizedEmail =
      email.trim();

    if (
      normalizedUsername.length < 3
    ) {
      toast.error(
        "Username must be at least 3 characters."
      );

      return;
    }

    if (!normalizedEmail) {
      toast.error(
        "Email address is required."
      );

      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );

      return;
    }

    if (
      password !== confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return;
    }

    try {
      setSubmitting(true);

      await register({
        username:
          normalizedUsername,
        email: normalizedEmail,
        password,
      });

      toast.success(
        "Account created successfully. You can now sign in."
      );

      navigate("/login", {
        replace: true,

        state: {
          registeredEmail:
            normalizedEmail,
        },
      });
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Account could not be created."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-5xl font-bold text-transparent">
            DevTrack
          </h1>

          <p className="mt-3 text-slate-400">
            Project Management Platform
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl shadow-black/30"
        >
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Create your DevTrack
              workspace account.
            </p>
          </div>

          <div className="mt-7">
            <label
              htmlFor="register-username"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Username
            </label>

            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Username"
                minLength={3}
                maxLength={50}
                required
                disabled={submitting}
                autoComplete="username"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="register-email"
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
                id="register-email"
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
              htmlFor="register-password"
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
                id="register-password"
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
                placeholder="At least 8 characters"
                minLength={8}
                required
                disabled={submitting}
                autoComplete="new-password"
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

          <div className="mt-5">
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Confirm Password
            </label>

            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                id="register-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Repeat password"
                minLength={8}
                required
                disabled={submitting}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={submitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
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
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Sign in
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