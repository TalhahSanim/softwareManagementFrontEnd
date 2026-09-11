import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { registerRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
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

    if (form.username.trim().length < 3 || form.username.trim().length > 30) {
      setError("Username must be between 3 and 30 characters.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const { token } = await registerRequest({
        username: form.username.trim(),
        fullname: form.fullname.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (!token) {
        throw new Error("Account created, but no auth token was returned.");
      }
      login(token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="panel" onSubmit={onSubmit}>
        <p className="eyebrow">Join the registry</p>
        <h2>Create account</h2>
        <p className="lede">
          Usernames are 3–30 characters. Passwords need at least 8 characters.
        </p>

        {error && <p className="banner error">{error}</p>}

        <label>
          Full name
          <input
            name="fullname"
            value={form.fullname}
            onChange={update}
            autoComplete="name"
            required
          />
        </label>
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={update}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            autoComplete="email"
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </section>
  );
}
