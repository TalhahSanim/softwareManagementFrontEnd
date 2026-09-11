import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createSoftware,
  getSoftware,
  getSoftwareById,
  updateSoftware,
} from "../api.js";
import { useAuth } from "../auth.jsx";

const empty = { name: "", softwareDescription: "" };

export default function SoftwareForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return undefined;
    let cancelled = false;
    (async () => {
      try {
        let record = null;
        if (isAdmin) {
          const { data } = await getSoftwareById(id, token);
          record = data;
        } else {
          const { data } = await getSoftware();
          record = (data || []).find((item) => String(item.id) === String(id));
        }
        if (!record) throw new Error("Software ID was Not Found");
        if (!cancelled) {
          setForm({
            name: record.name || "",
            softwareDescription: record.softwareDescription || "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editing, id, isAdmin, token]);

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 5 || form.name.trim().length > 40) {
      setError("Software name must be between 5 to 40 characters long.");
      return;
    }
    if (!form.softwareDescription.trim()) {
      setError("Please add a description.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        softwareDescription: form.softwareDescription.trim(),
      };
      if (editing) {
        await updateSoftware(id, payload, token);
        navigate(`/software/${id}`);
      } else {
        const { data } = await createSoftware(payload, token);
        navigate(`/software/${data.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="panel" onSubmit={onSubmit}>
        <p className="eyebrow">{editing ? "Update" : "Publish"}</p>
        <h2>{editing ? "Edit software" : "Add software"}</h2>
        <p className="lede">
          Names must be 5–40 characters. Creating a title also assigns it to your
          user record.
        </p>

        {error && <p className="banner error">{error}</p>}

        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={update}
            minLength={5}
            maxLength={40}
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="softwareDescription"
            value={form.softwareDescription}
            onChange={update}
            rows={6}
            required
          />
        </label>
        <div className="actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create software"}
          </button>
          <Link to={editing ? `/software/${id}` : "/"} className="btn ghost">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
