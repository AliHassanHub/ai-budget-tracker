import { formatRupees } from '../../utils/transactionDisplay';
import './BudgetCategoryCard.css';

function formatUsageLabel(usagePercentage, status) {
  if (usagePercentage === null || usagePercentage === undefined) {
    return status === 'over' ? 'Over budget' : '0% used';
  }

  const percentText = `${usagePercentage % 1 === 0 ? usagePercentage.toFixed(0) : usagePercentage}% used`;

  if (status === 'over') {
    return `${percentText} · Over budget`;
  }

  return percentText;
}

export default function BudgetCategoryCard({ category }) {
  const status = category.status || 'healthy';
  const usagePercentage = category.usagePercentage;
  const barWidth =
    usagePercentage === null || usagePercentage === undefined
      ? status === 'over'
        ? 100
        : 0
      : Math.min(Math.max(usagePercentage, 0), 100);

  // Cap aria-valuenow at 100 so ARIA stays valid when usage exceeds 100%.
  const ariaNow = Math.min(Math.max(barWidth, 0), 100);

  return (
    <article
      className={`category-card category-card--${status}`}
      aria-label={`${category.category} budget category`}
    >
      <header className="category-card__header">
        <h2 className="category-card__name">{category.category}</h2>
        <p className="category-card__percentage">{category.percentage}%</p>
      </header>

      <div className="category-card__allocated">
        <p className="category-card__label">Allocated</p>
        <p className="category-card__value category-card__value--primary">
          {formatRupees(category.allocated)}
        </p>
      </div>

      <div className="category-card__metrics">
        <div className="category-card__metric">
          <p className="category-card__label">Used</p>
          <p className="category-card__value">{formatRupees(category.used)}</p>
        </div>
        <div className="category-card__metric">
          <p className="category-card__label">Remaining</p>
          <p
            className={`category-card__value${
              category.remaining < 0 ? ' category-card__value--negative' : ''
            }`}
          >
            {formatRupees(category.remaining)}
          </p>
        </div>
      </div>

      <div className="category-card__progress-block">
        <div
          className="category-card__track"
          role="progressbar"
          aria-label={`${category.category} usage`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaNow}
          aria-valuetext={formatUsageLabel(usagePercentage, status)}
        >
          <div
            className="category-card__fill"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="category-card__usage">{formatUsageLabel(usagePercentage, status)}</p>
      </div>
    </article>
  );
}
