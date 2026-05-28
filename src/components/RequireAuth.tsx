import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const status = useAppSelector((state) => state.auth.status);
  if (status !== "unlocked") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
