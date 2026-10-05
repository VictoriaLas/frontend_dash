import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

function SessionCheck() {
  return (
    <div className="center-screen" aria-busy="true">
      <div className="spinner" />
    </div>
  );
}

// Exige sesión; si no la hay, manda al login recordando a dónde se quería ir
export function PrivateRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (user === undefined) return <SessionCheck />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Solo Administrador; un Cliente que llegue por URL vuelve al listado
export function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/vms" replace />;
}

// El login no tiene sentido con sesión iniciada
export function PublicOnlyRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (user === undefined) return <SessionCheck />;
  if (user) return <Navigate to={location.state?.from ?? "/dashboard"} replace />;
  return <Outlet />;
}
