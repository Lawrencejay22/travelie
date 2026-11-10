import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./pages/DashboardLayout";
import { Destinations } from "./pages/Destinations";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Overview } from "./pages/Overview";
import { Reviews } from "./pages/Reviews";
import { Users } from "./pages/Users";
import { getSession } from "./lib/api";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (getSession()?.user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="users" element={<Users />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
