import DocumentCard from './DocumentCard';
import Loading from './Loading';

/**
 * DocumentList Component
 *
 * Renders a list of documents with support for reviewer actions,
 * loading states, and customizable empty states.
 */
export default function DocumentList({
  documents = [],
  isLoading = false,
  isReviewer = false,
  onApprove,
  onReject,
  actionLoadingId = null,
  emptyMessage = 'No documents have been submitted yet.',
}) {
  if (isLoading) {
    return <Loading message="Retrieving documents from database..." />;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="state-box">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className="document-list" aria-label="Document Submissions">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          isReviewer={isReviewer}
          onApprove={onApprove}
          onReject={onReject}
          isActionLoading={actionLoadingId === doc.id}
        />
      ))}
    </section>
  );
}
