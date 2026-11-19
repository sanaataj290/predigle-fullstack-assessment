/**
 * Loading Component
 *
 * Displays a clean loading spinner and an accessible message.
 */
export default function Loading({ message = 'Loading documents...' }) {
  return (
    <div className="state-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p>{message}</p>
    </div>
  );
}
