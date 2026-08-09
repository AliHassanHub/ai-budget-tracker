import { useCallback, useEffect, useState } from 'react';
import { getTransactions } from '../../api/transactionsApi';
import TransactionHistoryItem from './TransactionHistoryItem';
import './TransactionHistoryPage.css';

function getFriendlyLoadError(error) {
  if (!error) {
    return "We couldn't load your transactions.";
  }

  if (error.status === 502 || error.status === 503 || error.status === 504) {
    return 'The server is temporarily unavailable. Please try again.';
  }

  if (error.message) {
    return error.message;
  }

  return "We couldn't load your transactions.";
}

export default function TransactionHistoryPage({
  onNavigate,
  transactionRevision = 0,
}) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getTransactions();
      setTransactions(response?.data?.transactions ?? []);
    } catch (loadError) {
      setTransactions([]);
      setError(getFriendlyLoadError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions, transactionRevision]);

  const showEmpty = !isLoading && !error && transactions.length === 0;

  return (
    <div className="history">
      <header className="history__header">
        <p className="history__eyebrow">Transaction history</p>
        <h1>Your transactions</h1>
        <p className="history__lede">
          Review everything you&apos;ve recorded and how it was categorized.
        </p>
      </header>

      {isLoading ? (
        <div className="history__list" aria-busy="true" aria-live="polite">
          <p className="visually-hidden">Loading transactions…</p>
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="history__skeleton" aria-hidden="true">
              <div className="history__skeleton-main">
                <div className="history__skeleton-line history__skeleton-line--sentence" />
                <div className="history__skeleton-line history__skeleton-line--amount" />
              </div>
              <div className="history__skeleton-meta">
                <div className="history__skeleton-line history__skeleton-line--badge" />
                <div className="history__skeleton-line history__skeleton-line--meta" />
                <div className="history__skeleton-line history__skeleton-line--meta" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <section className="history__panel history__panel--error" role="alert">
          <h2>Unable to load your transactions</h2>
          <p>{error}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={loadTransactions}
          >
            Try again
          </button>
        </section>
      ) : null}

      {showEmpty ? (
        <section className="history__panel history__panel--empty">
          <h2>No transactions yet</h2>
          <p>Your recorded income and expenses will appear here.</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onNavigate?.('transactions')}
          >
            Add your first transaction
          </button>
        </section>
      ) : null}

      {!isLoading && !error && transactions.length > 0 ? (
        <section className="history__list" aria-label="Recorded transactions">
          {transactions.map((transaction) => (
            <TransactionHistoryItem
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}
