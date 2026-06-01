import React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

type Role = "admin" | "staff" | "customer";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

export default function ProtectedRoute({
  children,
  allowedRoles = ["admin", "staff", "customer"],
}: ProtectedRouteProps) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(user.role as Role)) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
