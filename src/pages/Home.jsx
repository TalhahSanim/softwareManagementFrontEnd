import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSoftware } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Home() {
  const { user } = useAuth();
  const [software, setSoftware] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getSoftware();
        if (!cancelled) setSoftware(Array.isArray(data) ? data : []);
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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return software;
    return software.filter((item) =>
      `${item.name} ${item.softwareDescription}`.toLowerCase().includes(needle),
    );
  }, [software, query]);

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h2>Software titles</h2>
          <p className="lede">
            Browse every title in the registry. Signed-in users can publish new
            entries and attach them to their account.
          </p>
        </div>
        {user && (
          <Link to="/software/new" className="btn">
            Add software
          </Link>
        )}
      </div>

      <div className="toolbar">
        <label className="search">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name or description"
          />
        </label>
        <p className="count">{filtered.length} titles</p>
      </div>

      {error && <p className="banner error">{error}</p>}
      {loading && <p className="muted">Loading catalogue…</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty">
          <h3>Nothing in the ledger yet</h3>
          <p>Create an account and add the first software title.</p>
        </div>
      )}

      <div className="card-grid">
        {filtered.map((item) => (
          <Link key={item.id} to={`/software/${item.id}`} className="card">
            <p className="card-id">#{item.id}</p>
            <h3>{item.name}</h3>
            <p>{item.softwareDescription}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
