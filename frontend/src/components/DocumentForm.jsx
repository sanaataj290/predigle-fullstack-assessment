import { useState } from 'react';

/**
 * DocumentForm Component
 *
 * Provides a clean form for submitting document metadata.
 * Validates mandatory title and trims whitespace before submission.
 */
export default function DocumentForm({ onSubmit, isSubmitting = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientError, setClientError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setClientError('Document title is required and cannot contain only whitespace.');
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
      });
      // Clear form on successful submission
      setTitle('');
      setDescription('');
    } catch {
      // Parent component handles the error display
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Submit New Document</h2>

      {clientError && (
        <div className="alert alert-danger" role="alert">
          <span>{clientError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="doc-title" className="form-label">
            Document Title <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            id="doc-title"
            type="text"
            className="form-input"
            placeholder="e.g. Medical Report, Research Proposal"
            value={title}
            maxLength={255}
            required
            disabled={isSubmitting}
            onChange={(e) => {
              setTitle(e.target.value);
              if (clientError) setClientError('');
            }}
          />
          <div className="form-helper">
            Max 255 characters. Title is mandatory.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="doc-description" className="form-label">
            Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
          </label>
          <textarea
            id="doc-description"
            className="form-textarea"
            placeholder="Enter an optional brief summary or notes regarding this document submission..."
            value={description}
            rows={4}
            disabled={isSubmitting}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !title.trim()}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true"></span>
              <span>Submitting Document...</span>
            </>
          ) : (
            'Submit Document'
          )}
        </button>
      </form>
    </div>
  );
}
