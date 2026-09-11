import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const links = [
  { to: "/", label: "Catalog", end: true },
  { to: "/categories", label: "Categories" },
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-kicker">AT2</p>
            <h1>Software Registry</h1>
          </div>
        </div>

        <nav className="nav" onClick={() => setOpen(false)}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "nav-link is-active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/software/new"
              className={({ isActive }) =>
                isActive ? "nav-link is-active" : "nav-link"
              }
            >
              Add software
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? "nav-link is-active" : "nav-link"
              }
            >
              Users
            </NavLink>
          )}
        </nav>

        <div className="sidebar-foot">
          {user ? (
            <>
              <div className="who">
                <strong>{user.fullname || user.username}</strong>
                <span>{isAdmin ? "System admin" : user.email}</span>
              </div>
              <button type="button" className="btn ghost" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <div className="auth-links">
              <NavLink to="/login" className="btn" onClick={() => setOpen(false)}>
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="btn ghost"
                onClick={() => setOpen(false)}
              >
                Create account
              </NavLink>
            </div>
          )}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
          <p className="topbar-note">
            Catalogue, classify, and assign the tools your team ships.
          </p>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
