import { useState } from 'react';
import Navbar from './components/Navbar';
import SubmitterPage from './pages/SubmitterPage';
import ReviewerPage from './pages/ReviewerPage';
import './styles/global.css';
import './styles/components.css';
import './App.css';

/**
 * App Component
 *
 * Root component managing page navigation and global tab metrics.
 */
function App() {
  const [activeTab, setActiveTab] = useState('submitter');
  const [pendingCount, setPendingCount] = useState(0);

  const handleDocumentsChanged = (docs) => {
    if (Array.isArray(docs)) {
      const count = docs.filter(
        (d) => (d.status || '').toLowerCase() === 'pending'
      ).length;
      setPendingCount(count);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
      />

      <main className="main-container">
        {activeTab === 'submitter' ? (
          <SubmitterPage onDocumentsChanged={handleDocumentsChanged} />
        ) : (
          <ReviewerPage onDocumentsChanged={handleDocumentsChanged} />
        )}
      </main>

      <footer className="app-footer">
        <p>Simple Document Review System &bull; Technical Assessment</p>
      </footer>
    </div>
  );
}

export default App;
