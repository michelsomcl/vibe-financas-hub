
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Account, Category, ClientSupplier, PayableAccount, ReceivableAccount, Transaction } from '@/types';

interface FinanceContextType {
  accounts: Account[];
  setAccounts: (accounts: Account[] | ((prev: Account[]) => Account[])) => void;
  categories: Category[];
  setCategories: (categories: Category[] | ((prev: Category[]) => Category[])) => void;
  clientsSuppliers: ClientSupplier[];
  setClientsSuppliers: (clients: ClientSupplier[] | ((prev: ClientSupplier[]) => ClientSupplier[])) => void;
  payableAccounts: PayableAccount[];
  setPayableAccounts: (payables: PayableAccount[] | ((prev: PayableAccount[]) => PayableAccount[])) => void;
  receivableAccounts: ReceivableAccount[];
  setReceivableAccounts: (receivables: ReceivableAccount[] | ((prev: ReceivableAccount[]) => ReceivableAccount[])) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('vibe-accounts', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('vibe-categories', []);
  const [clientsSuppliers, setClientsSuppliers] = useLocalStorage<ClientSupplier[]>('vibe-clients-suppliers', []);
  const [payableAccounts, setPayableAccounts] = useLocalStorage<PayableAccount[]>('vibe-payables', []);
  const [receivableAccounts, setReceivableAccounts] = useLocalStorage<ReceivableAccount[]>('vibe-receivables', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('vibe-transactions', []);

  return (
    <FinanceContext.Provider value={{
      accounts,
      setAccounts,
      categories,
      setCategories,
      clientsSuppliers,
      setClientsSuppliers,
      payableAccounts,
      setPayableAccounts,
      receivableAccounts,
      setReceivableAccounts,
      transactions,
      setTransactions,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
