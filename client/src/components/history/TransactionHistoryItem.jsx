import {
  formatDirection,
  formatDisplayDate,
  formatRupees,
} from '../../utils/transactionDisplay';
import './TransactionHistoryItem.css';

export default function TransactionHistoryItem({ transaction }) {
  const direction = transaction.direction === 'income' ? 'income' : 'expense';
  const directionLabel = formatDirection(direction);

  return (
    <article className="history-item">
      <div className="history-item__main">
        <p className="history-item__sentence">{transaction.originalSentence}</p>
        <p
          className={`history-item__amount history-item__amount--${direction}`}
        >
          {formatRupees(transaction.amount)}
        </p>
      </div>

      <div className="history-item__meta">
        <span
          className={`history-item__direction history-item__direction--${direction}`}
        >
          {directionLabel}
        </span>
        <span className="history-item__category">{transaction.category}</span>
        <time className="history-item__date" dateTime={transaction.date}>
          {formatDisplayDate(transaction.date)}
        </time>
      </div>
    </article>
  );
}
