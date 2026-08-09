import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import BudgetRulesPage from './components/budgetRules/BudgetRulesPage';
import DashboardPage from './components/dashboard/DashboardPage';
import TransactionHistoryPage from './components/history/TransactionHistoryPage';
import TransactionsPage from './components/transactions/TransactionsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  let content = (
    <DashboardPage onNavigate={setCurrentPage} />
  );

  if (currentPage === 'transactions') {
    content = <TransactionsPage />;
  } else if (currentPage === 'history') {
    content = <TransactionHistoryPage onNavigate={setCurrentPage} />;
  } else if (currentPage === 'budget-rules') {
    content = <BudgetRulesPage />;
  }

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {content}
    </AppShell>
  );
}
