import { useState, useEffect, useCallback } from 'react';
import DocumentList from '../components/DocumentList';
import ErrorMessage from '../components/ErrorMessage';
import { getDocuments, updateDocumentStatus } from '../services/api';

/**
 * ReviewerPage Component
 *
 * Allows reviewers to inspect all document submissions and
 * approve or reject pending submissions.
 */
export default function ReviewerPage({ onDocumentsChanged }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

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

  const handleReviewAction = async (id, newStatus) => {
    setActionLoadingId(id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedDoc = await updateDocumentStatus(id, newStatus);

      // Update state locally with the server response
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => (doc.id === id ? updatedDoc : doc))
      );

      setSuccessMessage(
        `Document #${id} ("${updatedDoc.title}") has been ${newStatus}.`
      );

      // Notify parent to update tab badge counts
      if (onDocumentsChanged) {
        onDocumentsChanged(
          documents.map((doc) => (doc.id === id ? updatedDoc : doc))
        );
      }
    } catch (err) {
      setErrorMessage(err.message || `Failed to ${newStatus} document #${id}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = (id) => handleReviewAction(id, 'approved');
  const handleReject = (id) => handleReviewAction(id, 'rejected');

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    return (doc.status || '').toLowerCase() === filter;
  });

  const pendingCount = documents.filter(
    (d) => (d.status || '').toLowerCase() === 'pending'
  ).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reviewer Queue</h1>
        <p className="page-subtitle">
          Review submitted documents and approve or reject pending submissions.
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

      <div className="section-heading-row">
        <div>
          <h2 className="section-title">All Submissions</h2>
          <span className="section-count">
            {pendingCount} {pendingCount === 1 ? 'submission requires' : 'submissions require'} review
          </span>
        </div>

        {/* Quick Filter Controls */}
        <div style={{ display: 'flex', gap: '0.35rem' }} role="group" aria-label="Filter documents by status">
          {['all', 'pending', 'approved', 'rejected'].map((statusKey) => (
            <button
              key={statusKey}
              type="button"
              className={`nav-tab-btn ${filter === statusKey ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
              onClick={() => setFilter(statusKey)}
            >
              {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <DocumentList
        documents={filteredDocuments}
        isLoading={isLoading}
        isReviewer={true}
        onApprove={handleApprove}
        onReject={handleReject}
        actionLoadingId={actionLoadingId}
        emptyMessage={
          filter === 'all'
            ? 'No documents have been submitted yet.'
            : `No documents found with status "${filter}".`
        }
      />
    </div>
  );
}
