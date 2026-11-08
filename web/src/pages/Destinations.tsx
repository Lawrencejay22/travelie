import { useEffect, useMemo, useState } from 'react';
import { SearchIcon, SparkIcon } from '../components/Icons';
import { api, assetUrl, type Destination } from '../lib/api';
import { formatFee } from '../lib/format';

export function Destinations() {
  const [items, setItems] = useState<Destination[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .destinations({ sort: 'name', limit: 50 })
      .then((result) => {
        if (active) setItems(result.data);
      })
      .catch(() => {
        if (active) setError('Could not load destinations. Is the API running?');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.city.name.toLowerCase().includes(term) ||
        item.categories.some((category) => category.name.toLowerCase().includes(term)),
    );
  }, [items, search]);

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="search">
          <SearchIcon size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, city or category…"
            aria-label="Search destinations"
          />
        </div>
        <span className="toolbar__meta">
          {filtered.length} of {items.length} places
        </span>
        <span className="tag tag--soon">Editing lands in Week 13</span>
      </div>

      <section className="panel panel--table">
        {loading ? (
          <div className="panel--loading">
            <span className="spinner" />
            <p>Loading catalog…</p>
          </div>
        ) : error ? (
          <div className="panel--error">
            <p>{error}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>City</th>
                <th>Categories</th>
                <th>Entrance</th>
                <th>Saves</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((destination) => {
                const photo = assetUrl(destination.photos[0]?.url);
                return (
                  <tr key={destination.id}>
                    <td>
                      <div className="table__place">
                        {photo ? <img src={photo} alt="" /> : <span className="table__placeholder" />}
                        <div>
                          <strong>{destination.name}</strong>
                          <span>{destination.isFeatured ? 'Featured pick' : 'Catalog place'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{destination.city.name}</td>
                    <td>
                      <div className="chip-row">
                        {destination.categories.map((category) => (
                          <span key={category.slug} className="chip">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{formatFee(destination.entranceFee, destination.currency)}</td>
                    <td>{destination._count?.favorites ?? 0}</td>
                    <td>
                      <span className={`badge ${destination.isPublished ? 'badge--live' : 'badge--off'}`}>
                        {destination.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <p className="muted inline-note">
        <SparkIcon size={14} /> Every row is served by <code>GET /api/destinations</code> with
        categories, photos and favorite counts.
      </p>
    </div>
  );
}