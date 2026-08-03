import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LoaderCircle,
  Settings,
  X,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
} from "react";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  useSidebar,
} from "../contexts/SidebarContext";

import UserAvatar from "./UserAvatar";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Projects",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    path: "/tasks",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    loading,
  } = useAuth();

  const {
    isCollapsed,
    isMobileOpen,
    closeMobile,
  } = useSidebar();

  useEffect(() => {
    closeMobile();
  }, [
    location.pathname,
    closeMobile,
  ]);


  function openSettings() {
    closeMobile();
    navigate("/settings");
  }

  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-50
        flex
        w-72
        shrink-0
        flex-col
        border-r
        border-slate-800
        bg-slate-900
        transition-[width,transform]
        duration-300
        ease-in-out
        lg:static
        lg:translate-x-0
        ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
        ${
          isCollapsed
            ? "lg:w-20"
            : "lg:w-72"
        }
      `}
    >
      {/* Brand */}

      <div
        className={`
          flex
          h-20
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-800
          transition-all
          lg:h-24
          ${
            isCollapsed
              ? "px-5 lg:px-4"
              : "px-6 lg:px-7"
          }
        `}
      >
        <div
          className={`
            flex
            min-w-0
            items-center
            ${
              isCollapsed
                ? "justify-center lg:w-full"
                : "gap-3"
            }
          `}
        >
          <DevTrackLogo />

          <div
            className={`
              min-w-0
              ${
                isCollapsed
                  ? "lg:hidden"
                  : ""
              }
            `}
          >
            <h1 className="truncate bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              DevTrack
            </h1>

            <p className="mt-1 whitespace-nowrap text-xs font-medium tracking-wide text-slate-500">
              Project Management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeMobile}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>
      </div>

      {/* Menu */}

      <nav
        className={`
          flex-1
          overflow-y-auto
          overflow-x-hidden
          py-6
          transition-all
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          lg:overflow-visible
          ${
            isCollapsed
              ? "px-5 lg:px-3"
              : "px-5"
          }
        `}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              title={
                isCollapsed
                  ? item.title
                  : undefined
              }
              className={({
                isActive,
              }) =>
                `
                  group
                  relative
                  mb-2
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  py-4
                  transition-all
                  duration-300
                  ${
                    isCollapsed
                      ? "px-5 lg:justify-center lg:gap-0 lg:px-0"
                      : "px-5"
                  }
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `
              }
            >
              <Icon
                size={22}
                className="shrink-0"
              />

              <span
                className={`
                  whitespace-nowrap
                  font-medium
                  ${
                    isCollapsed
                      ? "lg:hidden"
                      : ""
                  }
                `}
              >
                {item.title}
              </span>

              {isCollapsed && (
                <span className="pointer-events-none absolute left-full z-[70] ml-4 hidden whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}

      <div
        className={`
          border-t
          border-slate-800
          transition-all
          ${
            isCollapsed
              ? "p-5 lg:p-3"
              : "p-5"
          }
        `}
      >
        <button
          type="button"
          onClick={openSettings}
          title={
            isCollapsed
              ? user?.username ||
                "Account settings"
              : undefined
          }
          className={`
            group
            relative
            flex
            w-full
            items-center
            gap-4
            rounded-xl
            p-2
            text-left
            transition
            hover:bg-slate-800
            ${
              isCollapsed
                ? "lg:justify-center lg:gap-0"
                : ""
            }
          `}
        >
          {loading ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-blue-400">
              <LoaderCircle
                className="animate-spin"
                size={20}
              />
            </div>
          ) : (
            <UserAvatar
              avatarKey={
                user?.avatarKey
              }
              size="lg"
            />
          )}

          <div
            className={`
              min-w-0
              ${
                isCollapsed
                  ? "lg:hidden"
                  : ""
              }
            `}
          >
            <h2 className="truncate font-semibold text-white">
              {loading
                ? "Loading..."
                : user?.username ||
                  "User"}
            </h2>

            <p className="truncate text-sm text-slate-400">
              {loading
                ? "Loading profile"
                : user?.email ||
                  "Account settings"}
            </p>
          </div>

          {isCollapsed && (
            <span className="pointer-events-none absolute left-full z-[70] ml-4 hidden whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
              {user?.username ||
                "Account settings"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

function DevTrackLogo() {
  return (
    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-slate-700
        bg-slate-950
        text-blue-400
        transition
        duration-300
      "
      aria-label="DevTrack"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 8V24"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        <path
          d="M10 8H15.5C21 8 24 11.1 24 16C24 20.9 21 24 15.5 24H10"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M14 12H15.3C18.35 12 20 13.45 20 16C20 18.55 18.35 20 15.3 20H14"
          stroke="rgba(34,211,238,0.85)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
