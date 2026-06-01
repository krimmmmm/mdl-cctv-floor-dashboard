import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FloorPlanProvider } from "./contexts/FloorPlanContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import DashboardOverview from "./pages/DashboardOverview";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route path="/login" component={Login} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/dashboard" component={DashboardOverview} />
      <Route path="/floorplan" component={Home} />
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
          <FloorPlanProvider>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </FloorPlanProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
