import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const identifier = form.identifier.trim();
      const payload = { password: form.password };
      if (identifier.includes("@")) payload.email = identifier;
      else payload.username = identifier;

      const { data } = await loginRequest(payload);
      login(typeof data === "string" ? data.trim() : data);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="panel" onSubmit={onSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in</h2>
        <p className="lede">Use your username or email and password.</p>

        {error && <p className="banner error">{error}</p>}

        <label>
          Username or email
          <input
            name="identifier"
            value={form.identifier}
            onChange={update}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
