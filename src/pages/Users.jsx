import { useState } from "react";
import { deleteUser, getUserById, updateUser } from "../api.js";
import { useAuth } from "../auth.jsx";

const emptyForm = {
  username: "",
  fullname: "",
  email: "",
  softwareName: "",
};

export default function Users() {
  const { token } = useAuth();
  const [lookupId, setLookupId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [found, setFound] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function applyUser(user) {
    setFound(user);
    setForm({
      username: user.username || "",
      fullname: user.fullname || "",
      email: user.email || "",
      softwareName: user.Software?.name || "",
    });
  }

  async function onLookup(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const { data } = await getUserById(lookupId.trim(), token);
      applyUser(data);
    } catch (err) {
      setFound(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onSave(event) {
    event.preventDefault();
    if (!found) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const payload = {
        username: form.username.trim(),
        fullname: form.fullname.trim(),
        email: form.email.trim(),
      };
      if (form.softwareName.trim()) {
        payload.softwareName = form.softwareName.trim();
      }
      const { data } = await updateUser(found.id, payload, token);
      applyUser(data);
      setNotice("User updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!found) return;
    if (!window.confirm(`Delete user ${found.username}?`)) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await deleteUser(found.id, token);
      setFound(null);
      setForm(emptyForm);
      setNotice("User deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Users</h2>
          <p className="lede">
            Look up a user by ID, update their profile, or assign them to a
            software title by name.
          </p>
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}
      {notice && <p className="banner success">{notice}</p>}

      <form className="inline-form" onSubmit={onLookup}>
        <label>
          User ID
          <input
            value={lookupId}
            onChange={(event) => setLookupId(event.target.value)}
            placeholder="e.g. 1"
            required
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          Look up
        </button>
      </form>

      {found && (
        <form className="panel" onSubmit={onSave}>
          <p className="eyebrow">User #{found.id}</p>
          <h3>{found.username}</h3>
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={update}
              required
            />
          </label>
          <label>
            Full name
            <input
              name="fullname"
              value={form.fullname}
              onChange={update}
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
              required
            />
          </label>
          <label>
            Assigned software name
            <input
              name="softwareName"
              value={form.softwareName}
              onChange={update}
              placeholder="Must match an existing title"
            />
          </label>
          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              Save user
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={onDelete}
              disabled={busy}
            >
              Delete user
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
