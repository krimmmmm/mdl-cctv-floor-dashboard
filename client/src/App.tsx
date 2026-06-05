import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FloorPlanProvider } from "./contexts/FloorPlanContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import DashboardOverview from "./pages/DashboardOverview";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import SchedulePage from "./pages/SchedulePage";
import RfaOnlinePage from "./pages/RfaOnlinePage";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route path="/login" component={Login} />

      <ProtectedRoute
        path="/admin/users"
        component={AdminUsers}
        allowedRoles={["admin"]}
      />

      <ProtectedRoute
        path="/dashboard"
        component={DashboardOverview}
        allowedRoles={["admin", "newstaff", "staffonly", "staff", "customer"]}
      />

      <ProtectedRoute
        path="/floorplan"
        component={Home}
        allowedRoles={["admin", "newstaff", "staffonly", "staff", "customer"]}
      />

      <ProtectedRoute
        path="/schedule"
        component={SchedulePage}
        allowedRoles={["admin", "newstaff", "staffonly", "staff", "customer"]}
      />

      <ProtectedRoute
        path="/rfa"
        component={RfaOnlinePage}
        allowedRoles={["admin", "newstaff", "staffonly", "staff", "customer"]}
      />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />

          <AuthProvider>
            <FloorPlanProvider>
              <Router />
            </FloorPlanProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
