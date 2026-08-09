import './AppShell.css';

export default function AppShell({ children, currentPage = 'transactions', onNavigate }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__header-inner">
          <div className="app-shell__brand">
            <span className="app-shell__mark" aria-hidden="true">
              AB
            </span>
            <div>
              <p className="app-shell__brand-name">AI Budget Tracker</p>
              <p className="app-shell__brand-tag">Personal allocation planner</p>
            </div>
          </div>

          <nav className="app-shell__nav" aria-label="Primary">
            <button
              type="button"
              className={`app-shell__nav-item${
                currentPage === 'transactions' ? ' app-shell__nav-item--active' : ''
              }`}
              aria-current={currentPage === 'transactions' ? 'page' : undefined}
              onClick={() => onNavigate?.('transactions')}
            >
              Transactions
            </button>
            <button
              type="button"
              className={`app-shell__nav-item${
                currentPage === 'budget-rules' ? ' app-shell__nav-item--active' : ''
              }`}
              aria-current={currentPage === 'budget-rules' ? 'page' : undefined}
              onClick={() => onNavigate?.('budget-rules')}
            >
              Budget Rules
            </button>
          </nav>
        </div>
      </header>

      <main className="app-shell__main">{children}</main>
    </div>
  );
}
