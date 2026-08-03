import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { LoaderCircle } from "lucide-react";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function PublicRoute() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-blue-400"
            size={38}
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading DevTrack...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}