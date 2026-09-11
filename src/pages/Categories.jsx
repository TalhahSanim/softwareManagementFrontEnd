import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Categories() {
  const { user, token, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const { data } = await getCategories();
    setCategories(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onCreate(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (name.trim().length < 5 || name.trim().length > 40) {
      setError("Category name must be between 5 to 40 characters long.");
      return;
    }
    if (!user) {
      setError("Sign in to create a category.");
      return;
    }
    setBusy(true);
    try {
      await createCategory({ name: name.trim() }, token);
      setName("");
      setNotice("Category created and linked to your assigned software.");
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onSave(id) {
    setError("");
    setNotice("");
    if (editingName.trim().length < 5 || editingName.trim().length > 40) {
      setError("Category name must be between 5 to 40 characters long.");
      return;
    }
    setBusy(true);
    try {
      await updateCategory(id, { name: editingName.trim() }, token);
      setEditingId(null);
      setNotice("Category updated.");
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(item) {
    if (!window.confirm(`Delete category “${item.name}”?`)) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await deleteCategory(item.id, token);
      setNotice("Category deleted.");
      await refresh();
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
          <p className="eyebrow">Taxonomy</p>
          <h2>Software categories</h2>
          <p className="lede">
            Group titles by purpose. New categories attach to the software
            currently assigned to your user.
          </p>
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}
      {notice && <p className="banner success">{notice}</p>}

      {user && (
        <form className="inline-form" onSubmit={onCreate}>
          <label>
            New category
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Design tools"
              minLength={5}
              maxLength={40}
              required
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            Create
          </button>
        </form>
      )}

      {loading && <p className="muted">Loading categories…</p>}

      {!loading && categories.length === 0 && (
        <div className="empty">
          <h3>No categories yet</h3>
          <p>Add one after you have created a software title.</p>
        </div>
      )}

      <ul className="table-list">
        {categories.map((item) => (
          <li key={item.id}>
            {editingId === item.id ? (
              <div className="row-edit">
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => onSave(item.id)}
                  disabled={busy}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  <strong>{item.name}</strong>
                  <span className="muted">
                    #{item.id}
                    {item.softwareId ? ` · software ${item.softwareId}` : ""}
                  </span>
                </div>
                {isAdmin && (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => onDelete(item)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
