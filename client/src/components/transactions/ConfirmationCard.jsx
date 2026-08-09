import { useEffect, useId, useRef, useState } from 'react';
import {
  formatDirection,
  formatDisplayDate,
  formatRupees,
} from '../../utils/transactionDisplay';
import './ConfirmationCard.css';

export default function ConfirmationCard({
  parsedTransaction,
  selectedCategory,
  availableCategories,
  onCategoryChange,
  onCancel,
  onConfirm,
  isSaving = false,
  saveError = '',
}) {
  const [isEditingCategory, setIsEditingCategory] = useState(
    parsedTransaction.direction === 'expense' && !selectedCategory,
  );
  const selectId = useId();
  const selectRef = useRef(null);

  const isExpense = parsedTransaction.direction === 'expense';
  const needsCategory = isExpense && !selectedCategory;
  const canConfirm = !needsCategory && !isSaving;

  useEffect(() => {
    if (isEditingCategory && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditingCategory]);

  useEffect(() => {
    if (parsedTransaction.direction === 'expense' && !selectedCategory) {
      setIsEditingCategory(true);
    }
  }, [parsedTransaction, selectedCategory]);

  return (
    <section
      className="confirmation-card"
      aria-labelledby="confirmation-card-title"
      aria-live="polite"
    >
      <div className="confirmation-card__badge-row">
        <p className="confirmation-card__badge">AI detected</p>
        <p className="confirmation-card__hint">Review before confirming</p>
      </div>

      <div className="confirmation-card__header">
        <span
          className={`confirmation-card__direction confirmation-card__direction--${parsedTransaction.direction}`}
        >
          {formatDirection(parsedTransaction.direction)}
        </span>
        <p className="confirmation-card__amount" id="confirmation-card-title">
          {formatRupees(parsedTransaction.amount)}
        </p>
      </div>

      <dl className="confirmation-card__meta">
        <div className="confirmation-card__meta-row">
          <dt>Category</dt>
          <dd>
            {isExpense ? (
              <div className="confirmation-card__category">
                {isEditingCategory ? (
                  <div className="confirmation-card__category-edit">
                    <label className="visually-hidden" htmlFor={selectId}>
                      Select a budget category
                    </label>
                    <select
                      id={selectId}
                      ref={selectRef}
                      className="confirmation-card__select"
                      value={selectedCategory || ''}
                      disabled={isSaving}
                      onChange={(event) => {
                        onCategoryChange(event.target.value || null);
                        if (event.target.value) {
                          setIsEditingCategory(false);
                        }
                      }}
                    >
                      <option value="">Select a category</option>
                      {availableCategories.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <span className="confirmation-card__category-value">
                      {selectedCategory}
                    </span>
                    <button
                      type="button"
                      className="confirmation-card__change"
                      onClick={() => setIsEditingCategory(true)}
                      disabled={isSaving}
                    >
                      Change
                    </button>
                  </>
                )}
                {needsCategory ? (
                  <p className="confirmation-card__category-prompt">
                    Select a category to continue.
                  </p>
                ) : null}
              </div>
            ) : (
              <span className="confirmation-card__category-value">Income</span>
            )}
          </dd>
        </div>

        <div className="confirmation-card__meta-row">
          <dt>Date</dt>
          <dd>{formatDisplayDate(parsedTransaction.date)}</dd>
        </div>
      </dl>

      {isSaving ? (
        <p className="confirmation-card__saving" aria-live="polite">
          Saving transaction…
        </p>
      ) : null}

      {saveError ? (
        <div className="confirmation-card__error" role="alert">
          <p>{saveError}</p>
          <p className="confirmation-card__error-help">
            Your review is still here. You can try confirming again.
          </p>
        </div>
      ) : null}

      <div className="confirmation-card__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={onConfirm}
          disabled={!canConfirm}
          aria-busy={isSaving}
        >
          {isSaving ? 'Saving…' : 'Confirm transaction'}
        </button>
      </div>
    </section>
  );
}
