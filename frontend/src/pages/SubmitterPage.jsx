import { useState, useEffect, useCallback } from 'react';
import DocumentForm from '../components/DocumentForm';
import DocumentList from '../components/DocumentList';
import ErrorMessage from '../components/ErrorMessage';
import { createDocument, getDocuments } from '../services/api';

/**
 * SubmitterPage Component
 *
 * Allows users to submit new documents and view all previously submitted documents.
 */
export default function SubmitterPage({ onDocumentsChanged }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      setErrorMessage('');
      const data = await getDocuments();
      setDocuments(data);
      if (onDocumentsChanged) {
        onDocumentsChanged(data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  }, [onDocumentsChanged]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createDocument(formData);
      setSuccessMessage('Document submitted successfully.');
      // Refresh documents list from database
      await loadDocuments();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit document.');
      throw err; // Let form know it failed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Submitter Portal</h1>
        <p className="page-subtitle">
          Submit document metadata for review and monitor submission statuses.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss success message"
          >
            &times;
          </button>
        </div>
      )}

      <ErrorMessage
        message={errorMessage}
        onDismiss={() => setErrorMessage('')}
      />

      <DocumentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      <div className="section-heading-row">
        <h2 className="section-title">Submitted Documents</h2>
        {!isLoading && (
          <span className="section-count">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
        )}
      </div>

      <DocumentList
        documents={documents}
        isLoading={isLoading}
        isReviewer={false}
        emptyMessage="No documents have been submitted yet."
      />
    </div>
  );
}
