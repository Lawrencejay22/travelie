import { useEffect, useState } from 'react';
import { api, type User } from '../lib/api';
import { formatDate, initials, titleCase } from '../lib/format';

type AdminUser = User & { _count: { favorites: number } };

export function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .users()
      .then((result) => {
        if (active) setUsers(result.data);
      })
      .catch(() => {
        if (active) setError('Could not load travelers. Is the API running?');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="stack">
      <div className="toolbar">
        <span className="toolbar__meta">{users.length} accounts</span>
        <span className="tag">Roles enforced by JWT guards</span>
      </div>

      <section className="panel panel--table">
        {loading ? (
          <div className="panel--loading">
            <span className="spinner" />
            <p>Loading travelers…</p>
          </div>
        ) : error ? (
          <div className="panel--error">
            <p>{error}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Traveler</th>
                <th>Role</th>
                <th>Saved places</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="table__place">
                      <span className="avatar">{initials(user.displayName)}</span>
                      <div>
                        <strong>{user.displayName}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${user.role === 'ADMIN' ? 'tag--gold' : ''}`}>
                      {titleCase(user.role)}
                    </span>
                  </td>
                  <td>{user._count.favorites}</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="muted inline-note">
        User management tools and audit logging arrive in Week 12. This view is read-only for now.
      </p>
    </div>
  );
}