import { useCallback, useState } from 'react';
import AppShell from './components/layout/AppShell';
import BudgetRulesPage from './components/budgetRules/BudgetRulesPage';
import DashboardPage from './components/dashboard/DashboardPage';
import TransactionHistoryPage from './components/history/TransactionHistoryPage';
import TransactionsPage from './components/transactions/TransactionsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transactionRevision, setTransactionRevision] = useState(0);

  const notifyTransactionSaved = useCallback(() => {
    setTransactionRevision((current) => current + 1);
  }, []);

  let content = (
    <DashboardPage
      onNavigate={setCurrentPage}
      transactionRevision={transactionRevision}
    />
  );

  if (currentPage === 'transactions') {
    content = (
      <TransactionsPage onTransactionSaved={notifyTransactionSaved} />
    );
  } else if (currentPage === 'history') {
    content = (
      <TransactionHistoryPage
        onNavigate={setCurrentPage}
        transactionRevision={transactionRevision}
      />
    );
  } else if (currentPage === 'budget-rules') {
    content = <BudgetRulesPage />;
  }

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {content}
    </AppShell>
  );
}
