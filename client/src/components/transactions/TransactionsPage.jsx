import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getBudgetRules } from '../../api/budgetRulesApi';
import { createTransaction, parseTransaction } from '../../api/transactionsApi';
import {
  formatDirection,
  formatDisplayDate,
  formatRupees,
} from '../../utils/transactionDisplay';
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

function getFriendlySaveError(error) {
  if (!error) {
    return 'We couldn’t save this transaction right now. Please try again.';
  }

  if (error.status === 400) {
    return error.message || 'This transaction could not be saved. Please review the details and try again.';
  }

  if (error.status === 429) {
    return 'The server is busy right now. Please wait a moment and try saving again.';
  }

  if (error.status === 502 || error.status === 503 || error.status === 504) {
    return 'The server is temporarily unavailable. Please try saving again.';
  }

  if (error.message) {
    return error.message;
  }

  return 'We couldn’t save this transaction right now. Please try again.';
}

export default function TransactionsPage({ onTransactionSaved }) {
  const inputId = useId();
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [parsedTransaction, setParsedTransaction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedTransaction, setSavedTransaction] = useState(null);
  const [categoriesError, setCategoriesError] = useState('');
  const isSavingRef = useRef(false);

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
    setParseError('');
    setSaveError('');
    setSavedTransaction(null);
    setIsSaving(false);
    isSavingRef.current = false;
  };

  const handleInputChange = (value) => {
    setInputText(value);
    if (parsedTransaction || savedTransaction || parseError || saveError) {
      resetParsedState();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = inputText.trim();
    if (!text || isParsing || isSaving) {
      return;
    }

    setIsParsing(true);
    setParseError('');
    setSaveError('');
    setSavedTransaction(null);
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
    if (isSavingRef.current) {
      return;
    }

    setParsedTransaction(null);
    setSelectedCategory(null);
    setSaveError('');
  };

  const handleConfirm = async () => {
    if (!parsedTransaction || isSavingRef.current) {
      return;
    }

    const category =
      parsedTransaction.direction === 'income' ? 'Income' : selectedCategory;

    if (!category) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      const response = await createTransaction({
        originalSentence: submittedText,
        amount: parsedTransaction.amount,
        direction: parsedTransaction.direction,
        category,
        date: parsedTransaction.date,
      });

      const saved = response?.data?.transaction;
      if (!saved) {
        throw new Error('Transaction was not saved correctly.');
      }

      setSavedTransaction(saved);
      setParsedTransaction(null);
      setSaveError('');
      onTransactionSaved?.();
    } catch (error) {
      setSaveError(getFriendlySaveError(error));
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const canSubmit = Boolean(inputText.trim()) && !isParsing && !isSaving;

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
              disabled={isParsing || isSaving}
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

      {parsedTransaction && !savedTransaction ? (
        <ConfirmationCard
          parsedTransaction={parsedTransaction}
          selectedCategory={selectedCategory}
          availableCategories={availableCategories}
          onCategoryChange={(value) => {
            setSelectedCategory(value);
            setSaveError('');
          }}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          isSaving={isSaving}
          saveError={saveError}
        />
      ) : null}

      {savedTransaction ? (
        <section className="transactions__saved" aria-live="polite">
          <p className="transactions__saved-badge">Transaction saved</p>
          <p className="transactions__saved-amount">
            {formatRupees(savedTransaction.amount)}
          </p>
          <p className="transactions__saved-meta">
            {formatDirection(savedTransaction.direction)} · {savedTransaction.category}
          </p>
          <p className="transactions__saved-date">
            {formatDisplayDate(savedTransaction.date)}
          </p>
          <p className="transactions__saved-message">
            Transaction saved successfully.
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
