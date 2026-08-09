import { useCallback, useEffect, useState } from 'react';
import { getDashboardSummary } from '../../api/dashboardApi';
import { formatMonthLabel, formatRupees } from '../../utils/transactionDisplay';
import BudgetCategoryCard from './BudgetCategoryCard';
import './DashboardPage.css';

function hasZeroActivity(categories) {
  return categories.every(
    (category) =>
      Number(category.allocated) === 0 &&
      Number(category.used) === 0 &&
      Number(category.remaining) === 0,
  );
}

function resolveSummary(dashboard) {
  if (dashboard?.summary) {
    return {
      totalIncome: Number(dashboard.summary.totalIncome) || 0,
      totalSpent: Number(dashboard.summary.totalSpent) || 0,
      available: Number(dashboard.summary.available) || 0,
    };
  }

  return {
    totalIncome: Number(dashboard?.totalIncome) || 0,
    totalSpent: 0,
    available: Number(dashboard?.totalIncome) || 0,
  };
}

export default function DashboardPage({ onNavigate, transactionRevision = 0 }) {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getDashboardSummary();
      setDashboard(
        response?.data ?? {
          month: '',
          totalIncome: 0,
          summary: { totalIncome: 0, totalSpent: 0, available: 0 },
          categories: [],
        },
      );
    } catch (loadError) {
      setDashboard(null);
      setError(
        loadError.message ||
          "We couldn't load this month's budget summary.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, transactionRevision]);

  const categories = dashboard?.categories ?? [];
  const summary = resolveSummary(dashboard);
  const monthLabel = formatMonthLabel(dashboard?.month);
  const showSetupState = !isLoading && !error && categories.length === 0;
  const showZeroActivity =
    !isLoading && !error && categories.length > 0 && hasZeroActivity(categories);
  const availableNegative = summary.available < 0;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <p className="dashboard__eyebrow">Budget overview</p>
        <h1>Your budget at a glance</h1>
        <p className="dashboard__lede">
          Track how your plan is performing this month.
        </p>
        {!isLoading && !error && dashboard?.month ? (
          <div className="dashboard__period" aria-live="polite">
            <p className="dashboard__period-label">Current period</p>
            <p className="dashboard__month">{monthLabel}</p>
          </div>
        ) : null}
      </header>

      {isLoading ? (
        <div className="dashboard__loading" aria-busy="true" aria-live="polite">
          <p className="visually-hidden">Loading budget summary…</p>
          <div className="dashboard__summary dashboard__summary--skeleton">
            {[0, 1, 2].map((item) => (
              <div key={item} className="dashboard__summary-item">
                <div className="dashboard__skeleton-line dashboard__skeleton-line--title" />
                <div className="dashboard__skeleton-line dashboard__skeleton-line--amount" />
              </div>
            ))}
          </div>
          <div className="dashboard__grid">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="dashboard__skeleton">
                <div className="dashboard__skeleton-line dashboard__skeleton-line--title" />
                <div className="dashboard__skeleton-line dashboard__skeleton-line--amount" />
                <div className="dashboard__skeleton-metrics">
                  <div className="dashboard__skeleton-line" />
                  <div className="dashboard__skeleton-line" />
                </div>
                <div className="dashboard__skeleton-line dashboard__skeleton-line--bar" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <section className="dashboard__panel dashboard__panel--error" role="alert">
          <h2>Unable to load your budget</h2>
          <p>{error}</p>
          <button type="button" className="button button--primary" onClick={loadDashboard}>
            Retry
          </button>
        </section>
      ) : null}

      {showSetupState ? (
        <section className="dashboard__panel dashboard__panel--setup">
          <p className="dashboard__setup-badge">Setup required</p>
          <h2>Your budget isn’t set up yet</h2>
          <p>
            Create your Budget Rules to see how your income is allocated across
            categories.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onNavigate?.('budget-rules')}
          >
            Set up budget
          </button>
        </section>
      ) : null}

      {!isLoading && !error && categories.length > 0 ? (
        <>
          <section
            className="dashboard__summary"
            aria-label="Month summary"
            aria-live="polite"
          >
            <div className="dashboard__summary-item">
              <p className="dashboard__summary-label">TOTAL INCOME</p>
              <p className="dashboard__summary-value dashboard__summary-value--accent">
                {formatRupees(summary.totalIncome)}
              </p>
            </div>
            <div className="dashboard__summary-item">
              <p className="dashboard__summary-label">TOTAL SPENT</p>
              <p className="dashboard__summary-value">
                {formatRupees(summary.totalSpent)}
              </p>
            </div>
            <div className="dashboard__summary-item">
              <p className="dashboard__summary-label">AVAILABLE</p>
              <p
                className={`dashboard__summary-value${
                  availableNegative
                    ? ' dashboard__summary-value--danger'
                    : ' dashboard__summary-value--accent'
                }`}
              >
                {formatRupees(summary.available)}
              </p>
            </div>
          </section>

          {showZeroActivity ? (
            <div className="dashboard__activity-note">
              <p>No activity recorded this month yet.</p>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => onNavigate?.('transactions')}
              >
                Add transaction
              </button>
            </div>
          ) : null}

          <section
            className="dashboard__grid"
            aria-label={`${monthLabel} budget categories`}
          >
            {categories.map((category) => (
              <BudgetCategoryCard key={category.category} category={category} />
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}
