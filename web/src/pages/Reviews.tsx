import { useEffect, useState } from "react";
import { api, type PendingReview } from "../lib/api";
import { formatDate } from "../lib/format";

export function Reviews() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setLoading(true);
    api
      .pendingReviews()
      .then(setReviews)
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error ? cause.message : "Could not load reviews.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (
    review: PendingReview,
    status: "APPROVED" | "REJECTED",
  ) => {
    setBusyId(review.id);
    setError(null);
    try {
      await api.moderateReview(review.id, status);
      setReviews((current) => current.filter((item) => item.id !== review.id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Review moderation failed.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack">
      <div className="toolbar">
        <span className="toolbar__meta">
          {reviews.length} reviews waiting for moderation
        </span>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <section className="panel panel--error" role="alert">
          <p>{error}</p>
        </section>
      ) : null}

      <section className="panel panel--table">
        {loading ? (
          <div className="panel--loading">
            <span className="spinner" />
            <p>Loading reviews…</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="panel--loading">
            <h2>All caught up</h2>
            <p>There are no reviews waiting for moderation.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Destination / traveler</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Reports</th>
                <th>Submitted</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <div className="table__place">
                      <div>
                        <strong>{review.destination.name}</strong>
                        <span>
                          {review.user.displayName} · {review.user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{review.title || "Untitled review"}</strong>
                    <span>{review.content}</span>
                  </td>
                  <td>{"★".repeat(review.rating)}</td>
                  <td>{review._count.reports}</td>
                  <td>{formatDate(review.createdAt)}</td>
                  <td>
                    <div className="review-actions">
                      <button
                        type="button"
                        className="btn btn--ink btn--sm"
                        onClick={() => void moderate(review, "APPROVED")}
                        disabled={busyId === review.id}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn--coral btn--sm"
                        onClick={() => void moderate(review, "REJECTED")}
                        disabled={busyId === review.id}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
