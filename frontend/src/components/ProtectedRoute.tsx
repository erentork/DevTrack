import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { LoaderCircle } from "lucide-react";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const location = useLocation();

  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <LoaderCircle
          className="mx-auto animate-spin text-blue-400"
          size={38}
        />

        <p className="mt-4 text-sm text-slate-400">
          Checking your session...
        </p>
      </div>
    </div>
  );
}