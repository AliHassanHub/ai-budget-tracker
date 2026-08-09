import { useCallback, useEffect, useId, useState } from 'react';
import { getBudgetRules } from '../../api/budgetRulesApi';
import { parseTransaction } from '../../api/transactionsApi';
import ConfirmationCard from './ConfirmationCard';
import './TransactionsPage.css';

function getFriendlyParseError(error) {
  if (!error) {
    return 'We couldn’t process that transaction right now. Please try again.';
  }

  if (error.status === 400) {
    return error.message || 'Please describe the amount and what it was for.';
  }

  if (error.status === 429) {
    return 'The assistant is busy right now. Please wait a moment and try again.';
  }

  if (error.status === 422) {
    return (
      error.message ||
      'Could not understand the transaction. Try including an amount and what it was for.'
    );
  }

  if (error.message) {
    return error.message;
  }

  return 'We couldn’t process that transaction right now. Please try again.';
}

export default function TransactionsPage() {
  const inputId = useId();
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [parsedTransaction, setParsedTransaction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const response = await getBudgetRules();
      const names = (response?.data?.categories ?? []).map((category) => category.name);
      setAvailableCategories(names);
      setCategoriesError('');
    } catch {
      setCategoriesError('Budget categories could not be loaded for review.');
      setAvailableCategories([]);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const resetParsedState = () => {
    setParsedTransaction(null);
    setSelectedCategory(null);
    setIsConfirmed(false);
    setParseError('');
  };

  const handleInputChange = (value) => {
    setInputText(value);
    if (parsedTransaction || isConfirmed || parseError) {
      resetParsedState();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = inputText.trim();
    if (!text || isParsing) {
      return;
    }

    setIsParsing(true);
    setParseError('');
    setIsConfirmed(false);
    setParsedTransaction(null);
    setSelectedCategory(null);
    setSubmittedText(text);

    try {
      const response = await parseTransaction(text);
      const data = response?.data;

      if (!data) {
        throw new Error('Could not understand the transaction.');
      }

      setParsedTransaction(data);
      setSelectedCategory(
        data.direction === 'income' ? 'Income' : data.category ?? null,
      );
    } catch (error) {
      setParseError(getFriendlyParseError(error));
    } finally {
      setIsParsing(false);
    }
  };

  const handleCancel = () => {
    setParsedTransaction(null);
    setSelectedCategory(null);
    setIsConfirmed(false);
    setParseError('');
  };

  const handleConfirm = () => {
    // Step 4B: frontend confirmation only.
    // Step 4C can replace this handler with a persistence API call.
    if (!parsedTransaction) {
      return;
    }

    if (parsedTransaction.direction === 'expense' && !selectedCategory) {
      return;
    }

    setIsConfirmed(true);
  };

  const canSubmit = Boolean(inputText.trim()) && !isParsing;

  return (
    <div className="transactions">
      <header className="transactions__header">
        <p className="transactions__eyebrow">Transaction assistant</p>
        <h1>What happened with your money?</h1>
        <p className="transactions__lede">
          Describe a transaction in your own words and we’ll organize it for you.
        </p>
      </header>

      <section className="transactions__panel" aria-labelledby="transaction-input-heading">
        <h2 id="transaction-input-heading" className="visually-hidden">
          Describe a transaction
        </h2>

        <form className="transactions__composer" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor={inputId}>
            Tell me what happened
          </label>
          <div className="transactions__input-shell">
            <textarea
              id={inputId}
              className="transactions__input"
              rows={2}
              value={inputText}
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (canSubmit) {
                    event.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              placeholder="Tell me what happened..."
              disabled={isParsing}
            />
            <button
              type="submit"
              className="transactions__send"
              disabled={!canSubmit}
              aria-label="Send transaction description"
            >
              {isParsing ? 'Sending…' : 'Send'}
            </button>
          </div>
          <p className="transactions__hint">
            Press Enter to send. Use Shift + Enter for a new line.
          </p>
        </form>

        <div className="transactions__status" aria-live="polite">
          {isParsing ? (
            <p className="transactions__loading">Understanding your transaction…</p>
          ) : null}

          {parseError ? (
            <div className="transactions__error" role="alert">
              <p>{parseError}</p>
              <p className="transactions__error-help">
                Try including an amount and what it was for, then send again.
              </p>
            </div>
          ) : null}

          {categoriesError ? (
            <p className="transactions__warning" role="status">
              {categoriesError}
            </p>
          ) : null}
        </div>
      </section>

      {parsedTransaction && !isConfirmed ? (
        <ConfirmationCard
          parsedTransaction={parsedTransaction}
          selectedCategory={selectedCategory}
          availableCategories={availableCategories}
          onCategoryChange={setSelectedCategory}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      ) : null}

      {isConfirmed && parsedTransaction ? (
        <section className="transactions__reviewed" aria-live="polite">
          <p className="transactions__reviewed-badge">Transaction reviewed</p>
          <h2>Ready to save in the next step</h2>
          <p>
            Your description “{submittedText}” was confirmed as{' '}
            {parsedTransaction.direction === 'income' ? 'income' : 'an expense'} of{' '}
            {selectedCategory || parsedTransaction.category || 'an unresolved category'}.
            Nothing has been saved to the database yet.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setInputText('');
              setSubmittedText('');
              resetParsedState();
            }}
          >
            Describe another transaction
          </button>
        </section>
      ) : null}
    </div>
  );
}
