import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CircleAlert,
  FolderKanban,
  ListTodo,
  LoaderCircle,
  Search,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useSidebar } from "../contexts/SidebarContext";

import {
  globalSearch,
} from "../services/searchService";

import {
  getNotifications,
} from "../services/notificationService";

import type {
  GlobalSearchResponse,
  SearchProject,
  SearchTask,
} from "../types/search";

import type {
  NotificationItem,
  NotificationResponse,
} from "../types/notification";

const emptySearchResults: GlobalSearchResponse = {
  projects: [],
  tasks: [],
};

const emptyNotifications: NotificationResponse = {
  totalCount: 0,
  items: [],
};

export default function Topbar() {
  const navigate = useNavigate();

  const {
    isCollapsed,
    toggleCollapsed,
    openMobile,
  } = useSidebar();

  const searchContainerRef =
    useRef<HTMLDivElement | null>(null);

  const notificationContainerRef =
    useRef<HTMLDivElement | null>(null);

  const [query, setQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<GlobalSearchResponse>(
      emptySearchResults
    );

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [notifications, setNotifications] =
    useState<NotificationResponse>(
      emptyNotifications
    );

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const [
    notificationsError,
    setNotificationsError,
  ] = useState("");

  const loadNotifications =
    useCallback(async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError("");

        const data =
          await getNotifications();

        setNotifications({
          totalCount:
            typeof data.totalCount === "number"
              ? data.totalCount
              : 0,

          items: Array.isArray(data.items)
            ? data.items
            : [],
        });
      } catch (error) {
        console.error(
          "Notifications could not be loaded:",
          error
        );

        setNotifications(
          emptyNotifications
        );

        setNotificationsError(
          "Notifications could not be loaded."
        );
      } finally {
        setNotificationsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadNotifications();

    const intervalId =
      window.setInterval(() => {
        void loadNotifications();
      }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  useEffect(() => {
    const normalizedQuery =
      query.trim();

    if (normalizedQuery.length < 2) {
      setSearchResults(
        emptySearchResults
      );

      setSearchLoading(false);
      setSearchError("");

      return;
    }

    const controller =
      new AbortController();

    const timerId =
      window.setTimeout(
        async () => {
          try {
            setSearchLoading(true);
            setSearchError("");

            const data =
              await globalSearch(
                normalizedQuery,
                controller.signal
              );

            if (
              controller.signal.aborted
            ) {
              return;
            }

            setSearchResults({
              projects: Array.isArray(
                data.projects
              )
                ? data.projects
                : [],

              tasks: Array.isArray(
                data.tasks
              )
                ? data.tasks
                : [],
            });

            setSearchOpen(true);
          } catch (error) {
            if (
              controller.signal.aborted
            ) {
              return;
            }

            console.error(
              "Global search failed:",
              error
            );

            setSearchResults(
              emptySearchResults
            );

            setSearchError(
              "Search results could not be loaded."
            );

            setSearchOpen(true);
          } finally {
            if (
              !controller.signal.aborted
            ) {
              setSearchLoading(false);
            }
          }
        },
        300
      );

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          target
        )
      ) {
        setSearchOpen(false);
      }

      if (
        notificationContainerRef.current &&
        !notificationContainerRef.current.contains(
          target
        )
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  function clearSearch() {
    setQuery("");

    setSearchResults(
      emptySearchResults
    );

    setSearchError("");
    setSearchOpen(false);
  }

  function openProject(
    project: SearchProject
  ) {
    clearSearch();

    navigate(
      `/projects/${project.id}`
    );
  }

  function openTask(
    task: SearchTask
  ) {
    clearSearch();

    navigate(
      `/projects/${task.projectId}`
    );
  }

  function openNotification(
    notification: NotificationItem
  ) {
    setNotificationsOpen(false);

    navigate(
      `/projects/${notification.projectId}`
    );
  }

  async function toggleNotifications() {
    const willOpen =
      !notificationsOpen;

    setNotificationsOpen(willOpen);
    setSearchOpen(false);

    if (willOpen) {
      await loadNotifications();
    }
  }

  const hasSearchResults =
    searchResults.projects.length > 0 ||
    searchResults.tasks.length > 0;

  const searchIsActive =
    query.trim().length >= 2;

  const notificationBadge =
    notifications.totalCount > 99
      ? "99+"
      : notifications.totalCount;

  return (
    <header className="relative z-30 flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-4 sm:px-6 lg:h-24 xl:gap-6 xl:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={openMobile}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:flex"
          aria-label={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {isCollapsed ? (
            <PanelLeftOpen size={21} />
          ) : (
            <PanelLeftClose size={21} />
          )}
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl xl:text-3xl">
            Welcome Back
          </h1>

          <p className="mt-1 hidden truncate text-sm text-slate-400 xl:block">
            Here's what's happening with your
            projects today.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3 xl:gap-5">
        {/* Global Search */}

        <div
          ref={searchContainerRef}
          className="relative hidden md:block"
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            value={query}
            onChange={(event) => {
              setQuery(
                event.target.value
              );

              setSearchOpen(true);
              setNotificationsOpen(false);
            }}
            onFocus={() => {
              if (searchIsActive) {
                setSearchOpen(true);
                setNotificationsOpen(false);
              }
            }}
            placeholder="Search projects and tasks..."
            className="w-56 rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 xl:w-80"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}

          {searchOpen &&
            searchIsActive && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[420px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
                {searchLoading ? (
                  <DropdownLoading
                    text="Searching..."
                  />
                ) : searchError ? (
                  <DropdownError
                    message={
                      searchError
                    }
                  />
                ) : !hasSearchResults ? (
                  <div className="px-6 py-10 text-center">
                    <Search
                      className="mx-auto text-slate-600"
                      size={30}
                    />

                    <p className="mt-3 font-medium text-white">
                      No results found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try a different search term.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[460px] overflow-y-auto p-3">
                    {searchResults
                      .projects.length >
                      0 && (
                      <SearchSection title="Projects">
                        {searchResults.projects.map(
                          (project) => (
                            <button
                              key={
                                project.id
                              }
                              type="button"
                              onClick={() =>
                                openProject(
                                  project
                                )
                              }
                              className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-800"
                            >
                              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                                <FolderKanban
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">
                                  {
                                    project.name
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {project.description ||
                                    "No description"}
                                </p>
                              </div>

                              <ArrowUpRight
                                className="text-slate-600 transition group-hover:text-blue-400"
                                size={17}
                              />
                            </button>
                          )
                        )}
                      </SearchSection>
                    )}

                    {searchResults.tasks
                      .length > 0 && (
                      <SearchSection title="Tasks">
                        {searchResults.tasks.map(
                          (task) => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() =>
                                openTask(
                                  task
                                )
                              }
                              className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-800"
                            >
                              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                                <ListTodo
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-white">
                                    {
                                      task.title
                                    }
                                  </p>

                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(
                                      task.status
                                    )}`}
                                  >
                                    {getStatusText(
                                      task.status
                                    )}
                                  </span>
                                </div>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {
                                    task.projectName
                                  }
                                </p>
                              </div>

                              <ArrowUpRight
                                className="text-slate-600 transition group-hover:text-blue-400"
                                size={17}
                              />
                            </button>
                          )
                        )}
                      </SearchSection>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Notifications */}

        <div
          ref={notificationContainerRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              void toggleNotifications()
            }
            className={`relative rounded-xl p-3 transition ${
              notificationsOpen
                ? "bg-blue-600 text-white"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
            aria-label="Notifications"
            aria-expanded={
              notificationsOpen
            }
          >
            <Bell size={20} />

            {notifications.totalCount >
              0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-red-500 px-1 text-[10px] font-bold text-white">
                {notificationBadge}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-[390px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-white">
                    Notifications
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Tasks requiring your attention
                  </p>
                </div>

                {notifications.totalCount >
                  0 && (
                  <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                    {
                      notifications.totalCount
                    }
                  </span>
                )}
              </div>

              {notificationsLoading ? (
                <DropdownLoading
                  text="Loading notifications..."
                />
              ) : notificationsError ? (
                <div className="px-6 py-8 text-center">
                  <DropdownError
                    message={
                      notificationsError
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      void loadNotifications()
                    }
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
                  >
                    Try Again
                  </button>
                </div>
              ) : notifications.items
                  .length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Bell
                    className="mx-auto text-slate-600"
                    size={32}
                  />

                  <p className="mt-3 font-medium text-white">
                    You're all caught up
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    No upcoming or overdue tasks.
                  </p>
                </div>
              ) : (
                <div className="max-h-[480px] overflow-y-auto p-3">
                  {notifications.items.map(
                    (notification) => (
                      <NotificationRow
                        key={
                          notification.taskId
                        }
                        notification={
                          notification
                        }
                        onClick={() =>
                          openNotification(
                            notification
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="rounded-xl bg-slate-900 p-3 transition hover:bg-slate-800"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

type NotificationRowProps = {
  notification: NotificationItem;
  onClick: () => void;
};

function NotificationRow({
  notification,
  onClick,
}: NotificationRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-800"
    >
      <div
        className={`mt-0.5 rounded-lg p-2 ${getNotificationIconClass(
          notification.type
        )}`}
      >
        {getNotificationIcon(
          notification.type
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 text-sm font-medium text-white">
            {notification.taskTitle}
          </p>

          <ArrowUpRight
            className="shrink-0 text-slate-600 transition group-hover:text-blue-400"
            size={16}
          />
        </div>

        <p
          className={`mt-1 text-xs font-medium ${getNotificationTextClass(
            notification.type
          )}`}
        >
          {notification.message}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="truncate">
            {notification.projectName}
          </span>

          <span>•</span>

          <span>
            {formatDate(
              notification.dueDate
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

type SearchSectionProps = {
  title: string;
  children: React.ReactNode;
};

function SearchSection({
  title,
  children,
}: SearchSectionProps) {
  return (
    <section className="mt-3 first:mt-0">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <div>{children}</div>
    </section>
  );
}

function DropdownLoading({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-10 text-sm text-slate-400">
      <LoaderCircle
        className="animate-spin text-blue-400"
        size={20}
      />

      {text}
    </div>
  );
}

function DropdownError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="text-center">
      <CircleAlert
        className="mx-auto text-red-400"
        size={28}
      />

      <p className="mt-3 text-sm text-red-400">
        {message}
      </p>
    </div>
  );
}

function getNotificationIcon(
  type: NotificationItem["type"]
) {
  switch (type) {
    case "overdue":
      return (
        <TriangleAlert size={18} />
      );

    case "dueToday":
      return (
        <CircleAlert size={18} />
      );

    case "dueSoon":
      return (
        <CalendarClock size={18} />
      );
  }
}

function getNotificationIconClass(
  type: NotificationItem["type"]
): string {
  switch (type) {
    case "overdue":
      return "bg-red-500/10 text-red-400";

    case "dueToday":
      return "bg-amber-500/10 text-amber-400";

    case "dueSoon":
      return "bg-blue-500/10 text-blue-400";
  }
}

function getNotificationTextClass(
  type: NotificationItem["type"]
): string {
  switch (type) {
    case "overdue":
      return "text-red-400";

    case "dueToday":
      return "text-amber-400";

    case "dueSoon":
      return "text-blue-400";
  }
}

function getStatusText(
  status: number
): string {
  switch (status) {
    case 0:
      return "To Do";

    case 1:
      return "In Progress";

    case 2:
      return "Completed";

    default:
      return "Unknown";
  }
}

function getStatusClass(
  status: number
): string {
  switch (status) {
    case 0:
      return "bg-slate-700 text-slate-300";

    case 1:
      return "bg-blue-500/10 text-blue-400";

    case 2:
      return "bg-emerald-500/10 text-emerald-400";

    default:
      return "bg-slate-700 text-slate-300";
  }
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
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}