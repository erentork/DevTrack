import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";

import {
  CalendarDays,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LogOut,
  Mail,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import UserAvatar, {
  AVATAR_OPTIONS,
} from "../components/UserAvatar";

import { useAuth } from "../contexts/AuthContext";

import {
  changePassword,
  getProfile,
  updateAvatar,
  updateProfile,
} from "../services/userService";

import type {
  ChangePasswordRequest,
  UserProfile,
} from "../types/user";

const emptyPasswordForm: ChangePasswordRequest = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export default function Settings() {
  const navigate = useNavigate();

  const {
    setUser,
    logout,
  } = useAuth();

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [passwordForm, setPasswordForm] =
    useState<ChangePasswordRequest>(
      emptyPasswordForm
    );

  const [loading, setLoading] =
    useState(true);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [
    avatarSavingKey,
    setAvatarSavingKey,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getProfile();

      setProfile(data);
      setUsername(data.username);
      setEmail(data.email);

      setUser(data);
    } catch (error) {
      console.error(
        "Profile could not be loaded:",
        error
      );

      setError(
        getApiErrorMessage(
          error,
          "Profile information could not be loaded."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedUsername =
      username.trim();

    const normalizedEmail =
      email.trim();

    if (normalizedUsername.length < 3) {
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

    try {
      setProfileSaving(true);

      const updatedProfile =
        await updateProfile({
          username: normalizedUsername,
          email: normalizedEmail,
        });

      setProfile(updatedProfile);
      setUsername(updatedProfile.username);
      setEmail(updatedProfile.email);

      // Sidebar ve diğer bileşenleri anında günceller.
      setUser(updatedProfile);

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Profile could not be updated."
        )
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error(
        "Current password is required."
      );

      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(
        "New password must be at least 8 characters."
      );

      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmNewPassword
    ) {
      toast.error(
        "New passwords do not match."
      );

      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      toast.error(
        "New password cannot be the same as the current password."
      );

      return;
    }

    try {
      setPasswordSaving(true);

      await changePassword(passwordForm);

      setPasswordForm(emptyPasswordForm);

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success(
        "Password updated successfully."
      );
    } catch (error) {
      console.error(
        "Password update failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Password could not be updated."
        )
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleAvatarChange(
    avatarKey: string
  ) {
    if (
      !profile ||
      avatarSavingKey ||
      profile.avatarKey === avatarKey
    ) {
      return;
    }

    const previousProfile = profile;

    const optimisticProfile = {
      ...profile,
      avatarKey,
    };

    setProfile(optimisticProfile);
    setUser(optimisticProfile);
    setAvatarSavingKey(avatarKey);

    try {
      const updatedProfile =
        await updateAvatar(avatarKey);

      setProfile(updatedProfile);
      setUser(updatedProfile);

      toast.success(
        "Avatar updated successfully."
      );
    } catch (error) {
      console.error(
        "Avatar update failed:",
        error
      );

      setProfile(previousProfile);
      setUser(previousProfile);

      toast.error(
        getApiErrorMessage(
          error,
          "Avatar could not be updated."
        )
      );
    } finally {
      setAvatarSavingKey(null);
    }
  }

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-blue-400"
              size={38}
            />

            <p className="mt-4 text-slate-400">
              Loading settings...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <TriangleAlert
              className="mx-auto text-red-400"
              size={40}
            />

            <h1 className="mt-4 text-xl font-semibold">
              Settings unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {error ||
                "Profile information could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadProfile()
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const profileChanged =
    username.trim() !== profile.username ||
    email.trim() !== profile.email;

  return (
    <DashboardLayout>
      <section>
        <p className="text-sm font-medium text-blue-400">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your profile, password and
          account preferences.
        </p>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <ProfileSummary
            profile={profile}
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Account Security
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Use a strong password and avoid
                  sharing your account credentials.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </aside>

        <div className="space-y-8">
          {/* Avatar picker */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <h2 className="text-xl font-semibold">
                Choose Avatar
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Select an avatar for your
                DevTrack profile.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {AVATAR_OPTIONS.map(
                (avatar) => {
                  const selected =
                    (profile.avatarKey ||
                      "orbit") ===
                    avatar.key;

                  const saving =
                    avatarSavingKey ===
                    avatar.key;

                  return (
                    <button
                      key={avatar.key}
                      type="button"
                      onClick={() =>
                        void handleAvatarChange(
                          avatar.key
                        )
                      }
                      disabled={
                        avatarSavingKey !==
                        null
                      }
                      className={`
                        flex
                        flex-col
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        px-4
                        py-5
                        text-sm
                        font-medium
                        transition
                        disabled:cursor-wait
                        disabled:opacity-70
                        ${
                          selected
                            ? "border-blue-500 bg-blue-500/10 text-white"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                        }
                      `}
                    >
                      <div className="relative">
                        <UserAvatar
                          avatarKey={
                            avatar.key
                          }
                          size="lg"
                          selected={
                            selected
                          }
                        />

                        {saving && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70">
                            <LoaderCircle
                              className="animate-spin text-white"
                              size={20}
                            />
                          </div>
                        )}
                      </div>

                      <span>
                        {avatar.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* Profile form */}

          <form
            onSubmit={handleProfileSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <SettingsIcon size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Profile Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update your account information.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <FormField
                label="Username"
                icon={<UserRound size={18} />}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  maxLength={50}
                  required
                  autoComplete="username"
                  placeholder="Username"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </FormField>

              <FormField
                label="Email address"
                icon={<Mail size={18} />}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </FormField>
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={
                  profileSaving ||
                  !profileChanged ||
                  username.trim().length < 3 ||
                  !email.trim()
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileSaving ? (
                  <LoaderCircle
                    className="animate-spin"
                    size={18}
                  />
                ) : (
                  <Save size={18} />
                )}

                Save Changes
              </button>
            </div>
          </form>

          {/* Password form */}

          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <KeyRound size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter your current password before
                  creating a new one.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <PasswordField
                label="Current password"
                value={
                  passwordForm.currentPassword
                }
                visible={
                  showCurrentPassword
                }
                onToggle={() =>
                  setShowCurrentPassword(
                    (current) => !current
                  )
                }
                onChange={(value) =>
                  setPasswordForm(
                    (current) => ({
                      ...current,
                      currentPassword: value,
                    })
                  )
                }
                autoComplete="current-password"
              />

              <div className="grid gap-7 md:grid-cols-2">
                <PasswordField
                  label="New password"
                  value={
                    passwordForm.newPassword
                  }
                  visible={
                    showNewPassword
                  }
                  onToggle={() =>
                    setShowNewPassword(
                      (current) => !current
                    )
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        newPassword: value,
                      })
                    )
                  }
                  autoComplete="new-password"
                />

                <PasswordField
                  label="Confirm new password"
                  value={
                    passwordForm
                      .confirmNewPassword
                  }
                  visible={
                    showConfirmPassword
                  }
                  onToggle={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        confirmNewPassword:
                          value,
                      })
                    )
                  }
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={
                  passwordSaving ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmNewPassword
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordSaving ? (
                  <LoaderCircle
                    className="animate-spin"
                    size={18}
                  />
                ) : (
                  <KeyRound size={18} />
                )}

                Update Password
              </button>
            </div>
          </form>
        </div>
      </section>
    </DashboardLayout>
  );
}

function ProfileSummary({
  profile,
}: {
  profile: UserProfile;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
      <div className="flex justify-center">
        <UserAvatar
          avatarKey={
            profile.avatarKey
          }
          size="xl"
        />
      </div>

      <h2 className="mt-4 break-words text-xl font-semibold">
        {profile.username}
      </h2>

      <p className="mt-1 break-words text-sm text-slate-400">
        {profile.email}
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500">
        <CalendarDays size={15} />

        <span>
          Member since{" "}
          {formatDate(profile.createdAt)}
        </span>
      </div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  icon: ReactNode;
  children: ReactNode;
};

function FormField({
  label,
  icon,
  children,
}: FormFieldProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>

        {children}
      </div>
    </label>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  autoComplete: string;
};

function PasswordField({
  label,
  value,
  visible,
  onToggle,
  onChange,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <div className="relative">
        <KeyRound
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          size={18}
        />

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          required
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-11 text-sm text-white outline-none transition focus:border-blue-500"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </label>
  );
}

function formatDate(
  dateValue: string
): string {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  ).format(date);
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
    const firstValidationMessage =
      Object.values(data.errors)
        .flat()
        .find(Boolean);

    if (firstValidationMessage) {
      return firstValidationMessage;
    }
  }

  if (data?.title) {
    return data.title;
  }

  return fallback;
}