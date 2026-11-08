import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import {
  ArrowIcon,
  CompassIcon,
  GridIcon,
  HeartIcon,
  LogOutIcon,
  MapIcon,
  UsersIcon,
} from "../components/Icons";
import { api, getSession, setSession } from "../lib/api";
import { initials } from "../lib/format";

const navigation = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: <GridIcon size={18} />,
    end: true,
  },
  {
    to: "/dashboard/destinations",
    label: "Destinations",
    icon: <MapIcon size={18} />,
  },
  { to: "/dashboard/users", label: "Travelers", icon: <UsersIcon size={18} /> },
  { to: "/dashboard/reviews", label: "Reviews", icon: <HeartIcon size={18} /> },
];

const titles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Overview",
    subtitle: "A calm read on where Travelie stands today.",
  },
  "/dashboard/destinations": {
    title: "Destinations",
    subtitle: "The curated catalog powering the mobile app.",
  },
  "/dashboard/users": {
    title: "Travelers",
    subtitle: "Accounts exploring Travelie.",
  },
  "/dashboard/reviews": {
    title: "Review moderation",
    subtitle: "Review traveler feedback before it appears publicly.",
  },
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const meta = titles[location.pathname] ?? titles["/dashboard"];

  const signOut = async () => {
    try {
      if (session?.refreshToken) await api.logout(session.refreshToken);
    } catch {
    } finally {
      setSession(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logo compact />
          <span className="sidebar__version">v0.1</span>
        </div>

        <nav className="sidebar__nav" aria-label="Dashboard">
          <span className="sidebar__label">Workspace</span>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "is-active" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          <span className="sidebar__label sidebar__label--spaced">
            Coming soon
          </span>
          <div className="sidebar__link sidebar__link--muted">
            <CompassIcon size={18} />
            <span>AR anchors</span>
            <span className="tag tag--soon">Wk 11</span>
          </div>
        </nav>

        <div className="sidebar__footer">
          <a href="/" className="sidebar__live">
            <ArrowIcon size={15} /> Open the traveler site
          </a>
          <div className="sidebar__user">
            <span className="avatar avatar--sm">
              {initials(session?.user.displayName ?? "Travelie Admin")}
            </span>
            <div>
              <strong>{session?.user.displayName ?? "Travelie Admin"}</strong>
              <span>{session?.user.email}</span>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="icon-btn"
              aria-label="Sign out"
            >
              <LogOutIcon size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <span className="topbar__crumb">
              Travelie <span>/</span> {meta.title}
            </span>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="topbar__actions">
            <span className="pill pill--soft">
              <span className="pulse-dot" /> API connected
            </span>
            <a href="/" className="btn btn--outline btn--sm">
              Traveler site
            </a>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
