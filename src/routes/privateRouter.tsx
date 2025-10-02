import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const isAuthenticated = false; 

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}