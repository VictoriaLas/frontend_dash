import { NavLink, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useVms } from "../context/VmsContext.jsx";
import Brand from "../components/Brand.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const LIVE_LABEL = { live: "En vivo", connecting: "Conectando…", offline: "Sin tiempo real" };

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { live } = useVms();

  return (
    <div className="wrap">
      <header className="topbar">
        <div className="topbar-left">
          <Brand />
          <nav className="nav" aria-label="Principal">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/vms" end>
              Máquinas virtuales
            </NavLink>
          </nav>
        </div>
        <div className="who">
          <span className={`live live-${live}`} title="Actualizaciones en tiempo real">
            <i aria-hidden="true" />
            {LIVE_LABEL[live]}
          </span>
          <span className="who-name">{user.name}</span>
          <span className={`role ${isAdmin ? "role-admin" : "role-client"}`}>{user.role}</span>
          <ThemeToggle />
          <button className="btn btn-sm" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
