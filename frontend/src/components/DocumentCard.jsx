import StatusBadge from './StatusBadge';

/**
 * DocumentCard Component
 *
 * Displays a single document submission with title, description,
 * formatted date, status badge, and reviewer actions (if enabled).
 */
export default function DocumentCard({
  document,
  isReviewer = false,
  onApprove,
  onReject,
  isActionLoading = false,
}) {
  const { id, title, description, status, created_at } = document;
  const isPending = (status || '').toLowerCase() === 'pending';

  const formattedDate = created_at
    ? new Date(created_at).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date';

  return (
    <article className="document-card" aria-labelledby={`doc-title-${id}`}>
      <div className="card-top-row">
        <div className="card-title-group">
          <div className="card-meta-line">
            <span>Doc #{id}</span>
            <span>&bull;</span>
            <time dateTime={created_at}>{formattedDate}</time>
          </div>
          <h3 id={`doc-title-${id}`} className="card-title">
            {title}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className={`card-description ${!description ? 'empty' : ''}`}>
        {description || 'No description provided.'}
      </p>

      {isReviewer && (
        <div className="card-actions-row">
          {isPending ? (
            <>
              <button
                type="button"
                className="btn-approve"
                disabled={isActionLoading}
                onClick={() => onApprove && onApprove(id)}
                aria-label={`Approve document: ${title}`}
              >
                {isActionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                type="button"
                className="btn-reject"
                disabled={isActionLoading}
                onClick={() => onReject && onReject(id)}
                aria-label={`Reject document: ${title}`}
              >
                {isActionLoading ? 'Processing...' : 'Reject'}
              </button>
            </>
          ) : (
            <span className="action-status-note">
              Review completed: <strong>{status}</strong>
            </span>
          )}
        </div>
      )}
    </article>
  );
}
