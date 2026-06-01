import React from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

type Role = "admin" | "staff" | "customer";

type ProtectedRouteProps = {
  path?: string;
  component?: React.ComponentType<any>;
  children?: React.ReactNode;
  allowedRoles?: Role[];
};

export default function ProtectedRoute({
  path,
  component: Component,
  children,
  allowedRoles = ["admin", "staff", "customer"],
}: ProtectedRouteProps) {
  const ProtectedContent = () => {
    const { user, isLoggedIn } = useAuth();

    if (!isLoggedIn || !user) {
      return <Redirect to="/login" />;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      return <Redirect to="/dashboard" />;
    }

    if (Component) {
      return <Component />;
    }

    return <>{children}</>;
  };

  if (path) {
    return (
      <Route path={path}>
        <ProtectedContent />
      </Route>
    );
  }

  return <ProtectedContent />;
}
