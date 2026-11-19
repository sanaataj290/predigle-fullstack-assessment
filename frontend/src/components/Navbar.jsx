/**
 * Navbar Component
 *
 * Provides tab-based navigation between Submitter and Reviewer views.
 */
export default function Navbar({ activeTab, onTabChange, pendingCount = 0 }) {
  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand" onClick={(e) => { e.preventDefault(); onTabChange('submitter'); }}>
          <span>Simple Document Review</span>
          <span className="brand-badge">Assessment</span>
        </a>

        <div className="nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'submitter'}
            className={`nav-tab-btn ${activeTab === 'submitter' ? 'active' : ''}`}
            onClick={() => onTabChange('submitter')}
          >
            Submitter
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviewer'}
            className={`nav-tab-btn ${activeTab === 'reviewer' ? 'active' : ''}`}
            onClick={() => onTabChange('reviewer')}
          >
            Reviewer
            {pendingCount > 0 && (
              <span className="tab-badge" title={`${pendingCount} pending documents`}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
