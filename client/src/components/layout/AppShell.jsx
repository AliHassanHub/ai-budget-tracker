import './AppShell.css';

export default function AppShell({ children }) {
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
            <span className="app-shell__nav-item app-shell__nav-item--active" aria-current="page">
              Budget Rules
            </span>
          </nav>
        </div>
      </header>

      <main className="app-shell__main">{children}</main>
    </div>
  );
}
