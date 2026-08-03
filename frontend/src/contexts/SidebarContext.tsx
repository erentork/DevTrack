import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SidebarContextValue = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext =
  createContext<SidebarContextValue | null>(null);

const STORAGE_KEY =
  "devtrack-sidebar-collapsed";

export function SidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] =
    useState(() => {
      if (typeof window === "undefined") {
        return false;
      }

      return (
        window.localStorage.getItem(
          STORAGE_KEY
        ) === "true"
      );
    });

  const [isMobileOpen, setIsMobileOpen] =
    useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      String(isCollapsed)
    );
  }, [isCollapsed]);

  const toggleCollapsed =
    useCallback(() => {
      setIsCollapsed(
        (current) => !current
      );
    }, []);

  const openMobile = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleCollapsed,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context =
    useContext(SidebarContext);

  if (!context) {
    throw new Error(
      "useSidebar must be used inside SidebarProvider."
    );
  }

  return context;
}