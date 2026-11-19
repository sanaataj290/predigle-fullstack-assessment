/**
 * ErrorMessage Component
 *
 * Displays a dismissible or inline alert message for API or validation errors.
 */
export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="alert-close"
          onClick={onDismiss}
          aria-label="Dismiss error message"
        >
          &times;
        </button>
      )}
    </div>
  );
}
