import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteSoftware, getSoftware, getSoftwareById } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function SoftwareDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAdmin } = useAuth();
  const [software, setSoftware] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
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
        if (!record) throw new Error("No Software Found");
        if (!cancelled) setSoftware(record);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAdmin, token]);

  async function onDelete() {
    if (!window.confirm(`Delete ${software?.name}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await deleteSoftware(id, token);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (error && !software) {
    return (
      <section>
        <p className="banner error">{error}</p>
        <Link to="/" className="btn ghost">
          Back to catalogue
        </Link>
      </section>
    );
  }

  if (!software) return <p className="muted">Loading title…</p>;

  return (
    <article className="detail">
      <p className="eyebrow">Title #{software.id}</p>
      <h2>{software.name}</h2>
      <p className="lede">{software.softwareDescription}</p>

      {error && <p className="banner error">{error}</p>}

      <dl className="meta">
        {software.userId && (
          <>
            <dt>Owner user ID</dt>
            <dd>{software.userId}</dd>
          </>
        )}
      </dl>

      <div className="actions">
        <Link to="/" className="btn ghost">
          Back
        </Link>
        {user && (
          <Link to={`/software/${software.id}/edit`} className="btn">
            Edit
          </Link>
        )}
        {user && (
          <button
            type="button"
            className="btn danger"
            onClick={onDelete}
            disabled={busy}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
