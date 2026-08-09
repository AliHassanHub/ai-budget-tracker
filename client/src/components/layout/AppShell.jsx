import './AppShell.css';

export default function AppShell({ children, currentPage = 'dashboard', onNavigate }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__header-inner">
          <div className="app-shell__brand">
            <img
              className="app-shell__mark"
              src="/brand-mark.svg"
              alt=""
              width={40}
              height={40}
              decoding="async"
              aria-hidden="true"
            />
            <div>
              <p className="app-shell__brand-name">AI Budget Tracker</p>
              <p className="app-shell__brand-tag">Personal allocation planner</p>
            </div>
          </div>

          <nav className="app-shell__nav" aria-label="Primary">
            <button
              type="button"
              className={`app-shell__nav-item${
                currentPage === 'dashboard' ? ' app-shell__nav-item--active' : ''
              }`}
              aria-current={currentPage === 'dashboard' ? 'page' : undefined}
              onClick={() => onNavigate?.('dashboard')}
            >
              Dashboard
            </button>
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
                currentPage === 'history' ? ' app-shell__nav-item--active' : ''
              }`}
              aria-current={currentPage === 'history' ? 'page' : undefined}
              onClick={() => onNavigate?.('history')}
            >
              History
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
