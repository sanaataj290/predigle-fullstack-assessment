/**
 * StatusBadge Component
 *
 * Visually distinguishes document review statuses:
 * - pending: amber / neutral
 * - approved: green
 * - rejected: red
 */
export default function StatusBadge({ status }) {
  const normalizedStatus = (status || 'pending').toLowerCase();

  return (
    <span
      className={`status-badge status-${normalizedStatus}`}
      role="status"
      aria-label={`Status: ${normalizedStatus}`}
    >
      {normalizedStatus}
    </span>
  );
}
