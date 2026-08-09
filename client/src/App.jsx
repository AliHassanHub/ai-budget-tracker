import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import BudgetRulesPage from './components/budgetRules/BudgetRulesPage';
import TransactionsPage from './components/transactions/TransactionsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('transactions');

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'budget-rules' ? <BudgetRulesPage /> : <TransactionsPage />}
    </AppShell>
  );
}
