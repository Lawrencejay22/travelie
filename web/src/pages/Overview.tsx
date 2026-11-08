import { useEffect, useState } from 'react';
import {
  ApiError,
  api,
  type Stats,
} from '../lib/api';
import {
  CalendarIcon,
  HeartIcon,
  MapIcon,
  PinIcon,
  SparkIcon,
  UsersIcon,
} from '../components/Icons';
import { formatDate, formatNumber, initials } from '../lib/format';

const milestones = [
  { label: 'Monorepo + design system', state: 'done' },
  { label: 'JWT auth with refresh rotation', state: 'done' },
  { label: 'Destination API + PostGIS', state: 'done' },
  { label: 'Explore, Saved & Profile screens', state: 'done' },
  { label: 'Admin dashboard shell', state: 'done' },
  { label: 'Nearby discovery (Week 7)', state: 'next' },
];

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .stats()
      .then(setStats)
      .catch((cause) => setError(cause instanceof ApiError ? cause.message : 'Could not reach the API.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div className="panel panel--loading">
        <span className="spinner" />
        <p>Loading workspace…</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="panel panel--error">
        <h2>The API is out of reach</h2>
        <p>{error ?? 'Unexpected error.'}</p>
        <p className="muted">
          Start it with <code>npm run dev:api</code> and make sure the database is seeded.
        </p>
        <button type="button" className="btn btn--ink btn--sm" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  const maxSaves = Math.max(1, ...stats.topDestinations.map((item) => item._count.favorites));

  return (
    <div className="stack">
      <div className="stat-grid">
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--teal">
            <UsersIcon size={19} />
          </span>
          <span className="stat-card__label">Travelers</span>
          <strong className="stat-card__value">{formatNumber(stats.counts.users)}</strong>
          <span className="stat-card__hint">Registered accounts</span>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--gold">
            <MapIcon size={19} />
          </span>
          <span className="stat-card__label">Destinations</span>
          <strong className="stat-card__value">{formatNumber(stats.counts.publishedDestinations)}</strong>
          <span className="stat-card__hint">Published in the catalog</span>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--coral">
            <HeartIcon size={19} />
          </span>
          <span className="stat-card__label">Saves</span>
          <strong className="stat-card__value">{formatNumber(stats.counts.favorites)}</strong>
          <span className="stat-card__hint">Places kept by travelers</span>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--pine">
            <PinIcon size={19} />
          </span>
          <span className="stat-card__label">Cities</span>
          <strong className="stat-card__value">{formatNumber(stats.counts.cities)}</strong>
          <span className="stat-card__hint">Across {stats.counts.categories} categories</span>
        </article>
      </div>

      <div className="overview-grid">
        <section className="panel">
          <header className="panel__head">
            <div>
              <span className="eyebrow">Most loved</span>
              <h2>Top destinations</h2>
            </div>
            <span className="tag">{stats.topDestinations.length} ranked</span>
          </header>
          <div className="rank-list">
            {stats.topDestinations.map((destination, index) => (
              <div key={destination.id} className="rank-row">
                <span className="rank-row__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="rank-row__body">
                  <div className="rank-row__title">
                    <strong>{destination.name}</strong>
                    <span>{destination.city.name}</span>
                  </div>
                  <div className="rank-row__bar">
                    <span style={{ width: `${(destination._count.favorites / maxSaves) * 100}%` }} />
                  </div>
                </div>
                <span className="rank-row__value">
                  <HeartIcon size={13} /> {destination._count.favorites}
                </span>
              </div>
            ))}
          </div>
          <p className="panel__foot muted">Saves are synced from traveler accounts in real time.</p>
        </section>

        <section className="panel">
          <header className="panel__head">
            <div>
              <span className="eyebrow">Newest</span>
              <h2>Recent travelers</h2>
            </div>
          </header>
          <ul className="people-list">
            {stats.recentUsers.map((user) => (
              <li key={user.id} className="people-row">
                <span className="avatar">{initials(user.displayName)}</span>
                <div className="people-row__copy">
                  <strong>{user.displayName}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="people-row__meta">
                  <span className={`tag ${user.role === 'ADMIN' ? 'tag--gold' : ''}`}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Traveler'}
                  </span>
                  <span className="muted">{formatDate(user.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="overview-grid overview-grid--wide">
        <section className="panel">
          <header className="panel__head">
            <div>
              <span className="eyebrow">Build status</span>
              <h2>Foundation shipped</h2>
            </div>
            <span className="tag tag--gold">
              <SparkIcon size={12} /> Week 1–2
            </span>
          </header>
          <ul className="checklist">
            {milestones.map((item) => (
              <li key={item.label} className={item.state === 'done' ? 'is-done' : 'is-next'}>
                <span className="checklist__marker">{item.state === 'done' ? '✓' : '→'}</span>
                <span>{item.label}</span>
                <span className="checklist__state">{item.state === 'done' ? 'Complete' : 'Next up'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel--dark">
          <span className="eyebrow eyebrow--light">Next milestone</span>
          <h2>Nearby discovery</h2>
          <p>
            Week 7 turns the PostGIS geography column into a nearby-attractions screen with
            distance-aware sorting and a manual city fallback.
          </p>
          <div className="mini-metric">
            <CalendarIcon size={17} />
            <span>Week 7 · 20–25 hours planned</span>
          </div>
          <div className="mini-metric">
            <PinIcon size={17} />
            <span>PostGIS trigger already syncing coordinates</span>
          </div>
        </section>
      </div>
    </div>
  );
}