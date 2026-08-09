import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getBudgetRules, saveBudgetRules } from '../../api/budgetRulesApi';
import {
  createEmptyCategory,
  getAllocationTotal,
  isPercentageInputAllowed,
  mapServerCategories,
  serializeCategories,
  toSavePayload,
  validateBudgetRulesForm,
} from '../../utils/budgetRulesValidation';
import AllocationSummary from './AllocationSummary';
import CategoryRow from './CategoryRow';
import './BudgetRulesPage.css';

export default function BudgetRulesPage() {
  const [categories, setCategories] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState('[]');
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [focusNewCategoryId, setFocusNewCategoryId] = useState(null);

  const nameInputRefs = useRef(new Map());
  const successTimeoutRef = useRef(null);

  const loadRules = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');
    setSaveError('');
    setSuccessMessage('');
    setShowValidation(false);

    try {
      const response = await getBudgetRules();
      const nextCategories = mapServerCategories(response?.data?.categories ?? []);
      setCategories(nextCategories);
      setSavedSnapshot(serializeCategories(nextCategories));
      setLoadState('ready');
    } catch (error) {
      setLoadError(error.message || 'Budget rules could not be loaded.');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  useEffect(() => {
    if (!focusNewCategoryId) {
      return;
    }

    const input = nameInputRefs.current.get(focusNewCategoryId);
    if (input) {
      input.focus();
    }
    setFocusNewCategoryId(null);
  }, [focusNewCategoryId, categories]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const validation = useMemo(
    () => validateBudgetRulesForm(categories),
    [categories],
  );

  const total = useMemo(() => getAllocationTotal(categories), [categories]);
  const isDirty = serializeCategories(categories) !== savedSnapshot;
  const canSave = validation.isValid && isDirty && !isSaving;

  const setNameInputRef = (id, node) => {
    if (node) {
      nameInputRefs.current.set(id, node);
    } else {
      nameInputRefs.current.delete(id);
    }
  };

  const handleNameChange = (id, value) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, name: value } : category,
      ),
    );
    setSaveError('');
    setSuccessMessage('');
  };

  const handlePercentageChange = (id, value) => {
    if (!isPercentageInputAllowed(value)) {
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, percentage: value } : category,
      ),
    );
    setSaveError('');
    setSuccessMessage('');
  };

  const handleAddCategory = () => {
    const next = createEmptyCategory();
    setCategories((current) => [...current, next]);
    setFocusNewCategoryId(next.id);
    setShowValidation(false);
    setSaveError('');
    setSuccessMessage('');
  };

  const handleRemoveCategory = (id) => {
    setCategories((current) => current.filter((category) => category.id !== id));
    setSaveError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    setShowValidation(true);
    setSaveError('');
    setSuccessMessage('');

    const currentValidation = validateBudgetRulesForm(categories);
    if (!currentValidation.isValid) {
      setSaveError(
        currentValidation.formError ||
          'Fix the highlighted fields before saving.',
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await saveBudgetRules(toSavePayload(categories));
      const nextCategories = mapServerCategories(response?.data?.categories ?? []);
      setCategories(nextCategories);
      setSavedSnapshot(serializeCategories(nextCategories));
      setShowValidation(false);
      setSuccessMessage('Budget rules saved successfully.');

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
      }, 3200);
    } catch (error) {
      setSaveError(error.message || 'Unable to save budget rules.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <div className="budget-rules">
        <PageHeader />
        <div className="budget-rules__panel" aria-busy="true" aria-live="polite">
          <p className="budget-rules__loading-label">Loading budget rules…</p>
          <div className="budget-rules__skeleton" />
          <div className="budget-rules__skeleton" />
          <div className="budget-rules__skeleton budget-rules__skeleton--short" />
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="budget-rules">
        <PageHeader />
        <div className="budget-rules__panel budget-rules__panel--error" role="alert">
          <h2>Couldn’t load budget rules</h2>
          <p>
            {loadError ||
              'Something went wrong while loading your configuration from the server.'}
          </p>
          <button type="button" className="button button--primary" onClick={loadRules}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-rules">
      <PageHeader />

      <AllocationSummary total={total} />

      <section className="budget-rules__panel" aria-labelledby="budget-rules-editor-heading">
        <div className="budget-rules__panel-header">
          <div>
            <h2 id="budget-rules-editor-heading">Categories</h2>
            <p>Add unlimited categories and assign an allocation percentage to each.</p>
          </div>
          {isDirty ? (
            <span className="budget-rules__dirty" aria-live="polite">
              Unsaved changes
            </span>
          ) : null}
        </div>

        {categories.length === 0 ? (
          <div className="budget-rules__empty">
            <h3>Set up your budget</h3>
            <p>
              Create categories and assign percentages to define how future income will
              be distributed.
            </p>
            <button
              type="button"
              className="button button--primary"
              onClick={handleAddCategory}
            >
              + Add your first category
            </button>
          </div>
        ) : (
          <>
            <div className="budget-rules__list" role="list">
              {categories.map((category, index) => {
                const rawErrors = validation.fieldErrors[category.id] || {};
                const liveErrors = {
                  name:
                    rawErrors.name === 'Category name is required' && !showValidation
                      ? undefined
                      : rawErrors.name,
                  percentage:
                    rawErrors.percentage === 'Percentage is required' && !showValidation
                      ? undefined
                      : rawErrors.percentage,
                };
                const hasLiveErrors = Boolean(liveErrors.name || liveErrors.percentage);

                return (
                  <div key={category.id} role="listitem">
                    <CategoryRow
                      category={category}
                      index={index}
                      errors={liveErrors}
                      showErrors={hasLiveErrors || showValidation}
                      onNameChange={handleNameChange}
                      onPercentageChange={handlePercentageChange}
                      onRemove={handleRemoveCategory}
                      nameInputRef={(node) => setNameInputRef(category.id, node)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="budget-rules__toolbar">
              <button
                type="button"
                className="button button--secondary"
                onClick={handleAddCategory}
              >
                + Add category
              </button>

              <div className="budget-rules__save-group">
                {successMessage ? (
                  <p className="budget-rules__success" role="status">
                    {successMessage}
                  </p>
                ) : null}
                {saveError ? (
                  <p className="budget-rules__error" role="alert">
                    {saveError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleSave}
                  disabled={!canSave}
                  aria-disabled={!canSave}
                >
                  {isSaving ? 'Saving…' : 'Save Budget Rules'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="budget-rules__header">
      <p className="budget-rules__eyebrow">Budget configuration</p>
      <h1>Budget Rules</h1>
      <p className="budget-rules__lede">
        Define how your income should be distributed across your budget categories.
      </p>
    </header>
  );
}
