import './AllocationSummary.css';
import { formatPercent, getAllocationMessage } from '../../utils/budgetRulesValidation';

export default function AllocationSummary({ total }) {
  const { tone, message } = getAllocationMessage(total);
  const clamped = Math.min(Math.max(total, 0), 100);
  const isOverflow = total > 100;

  return (
    <section className={`allocation-summary allocation-summary--${tone}`} aria-live="polite">
      <div className="allocation-summary__header">
        <div>
          <p className="allocation-summary__eyebrow">Total allocated</p>
          <p className="allocation-summary__total">{formatPercent(total)}</p>
        </div>
        <p className="allocation-summary__message">{message}</p>
      </div>

      <div
        className="allocation-summary__track"
        role="progressbar"
        aria-label="Budget allocation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={`${formatPercent(total)} allocated`}
      >
        <div
          className="allocation-summary__fill"
          style={{ width: `${clamped}%` }}
        />
        {isOverflow ? <div className="allocation-summary__overflow" aria-hidden="true" /> : null}
      </div>
    </section>
  );
}
