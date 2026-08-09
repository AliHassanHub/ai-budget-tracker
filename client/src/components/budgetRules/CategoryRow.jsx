import './CategoryRow.css';

export default function CategoryRow({
  category,
  index,
  errors = {},
  showErrors,
  onNameChange,
  onPercentageChange,
  onRemove,
  nameInputRef,
}) {
  const nameId = `category-name-${category.id}`;
  const percentageId = `category-percentage-${category.id}`;
  const nameErrorId = `${nameId}-error`;
  const percentageErrorId = `${percentageId}-error`;
  const label = category.name.trim() || `Category ${index + 1}`;

  return (
    <div className="category-row">
      <div className="category-row__field category-row__field--name">
        <label className="category-row__label" htmlFor={nameId}>
          Category
        </label>
        <input
          ref={nameInputRef}
          id={nameId}
          className={`category-row__input${showErrors && errors.name ? ' is-invalid' : ''}`}
          type="text"
          value={category.name}
          onChange={(event) => onNameChange(category.id, event.target.value)}
          placeholder="e.g. Household"
          autoComplete="off"
          aria-invalid={showErrors && Boolean(errors.name)}
          aria-describedby={showErrors && errors.name ? nameErrorId : undefined}
        />
        {showErrors && errors.name ? (
          <p id={nameErrorId} className="category-row__error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="category-row__field category-row__field--percentage">
        <label className="category-row__label" htmlFor={percentageId}>
          Allocation
        </label>
        <div
          className={`category-row__percent-control${
            showErrors && errors.percentage ? ' is-invalid' : ''
          }`}
        >
          <input
            id={percentageId}
            className="category-row__input category-row__input--percent"
            type="text"
            inputMode="decimal"
            value={category.percentage}
            onChange={(event) => onPercentageChange(category.id, event.target.value)}
            placeholder="0"
            autoComplete="off"
            aria-invalid={showErrors && Boolean(errors.percentage)}
            aria-describedby={
              showErrors && errors.percentage ? percentageErrorId : undefined
            }
          />
          <span className="category-row__suffix" aria-hidden="true">
            %
          </span>
        </div>
        {showErrors && errors.percentage ? (
          <p id={percentageErrorId} className="category-row__error">
            {errors.percentage}
          </p>
        ) : null}
      </div>

      <div className="category-row__actions">
        <span className="category-row__label category-row__label--desktop">Action</span>
        <button
          type="button"
          className="category-row__remove"
          onClick={() => onRemove(category.id)}
          aria-label={`Remove ${label}`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
