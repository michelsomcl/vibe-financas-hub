
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Account, Category, ClientSupplier, PayableAccount, ReceivableAccount, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
  loading: boolean;
  addPayableAccount: (payable: Omit<PayableAccount, 'id' | 'createdAt'>) => Promise<void>;
  updatePayableAccount: (id: string, updates: Partial<PayableAccount>) => Promise<void>;
  deletePayableAccount: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  addClientSupplier: (client: Omit<ClientSupplier, 'id' | 'createdAt'>) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clientsSuppliers, setClientsSuppliers] = useState<ClientSupplier[]>([]);
  const [payableAccounts, setPayableAccounts] = useState<PayableAccount[]>([]);
  const [receivableAccounts, setReceivableAccounts] = useState<ReceivableAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar dados do Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [
        accountsRes,
        categoriesRes,
        clientsSuppliersRes,
        payablesRes,
        receivablesRes,
        transactionsRes
      ] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('clients_suppliers').select('*').order('name'),
        supabase.from('payable_accounts').select('*').order('due_date', { ascending: false }),
        supabase.from('receivable_accounts').select('*').order('due_date', { ascending: false }),
        supabase.from('transactions').select('*').order('payment_date', { ascending: false })
      ]);

      if (accountsRes.data) {
        setAccounts(accountsRes.data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'banco' | 'dinheiro' | 'caixa' | 'cartao',
          initialBalance: Number(item.initial_balance),
          currentBalance: Number(item.current_balance),
          createdAt: new Date(item.created_at)
        })));
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'receita' | 'despesa',
          createdAt: new Date(item.created_at)
        })));
      }

      if (clientsSuppliersRes.data) {
        setClientsSuppliers(clientsSuppliersRes.data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'cliente' | 'fornecedor',
          observations: item.observations || undefined,
          createdAt: new Date(item.created_at)
        })));
      }

      if (payablesRes.data) {
        setPayableAccounts(payablesRes.data.map(item => ({
          id: item.id,
          supplierId: item.supplier_id,
          categoryId: item.category_id,
          value: Number(item.value),
          dueDate: new Date(item.due_date),
          observations: item.observations || undefined,
          installmentType: item.installment_type as 'unico' | 'parcelado' | 'recorrente',
          installments: item.installments || undefined,
          recurrenceType: item.recurrence_type as 'diario' | 'semanal' | 'quinzenal' | 'mensal' | undefined,
          recurrenceCount: item.recurrence_count || undefined,
          isPaid: item.is_paid,
          paidDate: item.paid_date ? new Date(item.paid_date) : undefined,
          parentId: item.parent_id || undefined,
          createdAt: new Date(item.created_at)
        })));
      }

      if (receivablesRes.data) {
        setReceivableAccounts(receivablesRes.data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          categoryId: item.category_id,
          value: Number(item.value),
          dueDate: new Date(item.due_date),
          observations: item.observations || undefined,
          installmentType: item.installment_type as 'unico' | 'parcelado' | 'recorrente',
          installments: item.installments || undefined,
          recurrenceType: item.recurrence_type as 'diario' | 'semanal' | 'quinzenal' | 'mensal' | undefined,
          recurrenceCount: item.recurrence_count || undefined,
          isReceived: item.is_received,
          receivedDate: item.received_date ? new Date(item.received_date) : undefined,
          parentId: item.parent_id || undefined,
          createdAt: new Date(item.created_at)
        })));
      }

      if (transactionsRes.data) {
        setTransactions(transactionsRes.data.map(item => ({
          id: item.id,
          type: item.type as 'receita' | 'despesa',
          clientSupplierId: item.client_supplier_id,
          categoryId: item.category_id,
          value: Number(item.value),
          paymentDate: new Date(item.payment_date),
          observations: item.observations || undefined,
          sourceType: item.source_type as 'manual' | 'payable' | 'receivable',
          sourceId: item.source_id || undefined,
          createdAt: new Date(item.created_at)
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do banco",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPayableAccount = async (payable: Omit<PayableAccount, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('payable_accounts')
        .insert([{
          supplier_id: payable.supplierId,
          category_id: payable.categoryId,
          value: payable.value,
          due_date: payable.dueDate.toISOString().split('T')[0],
          observations: payable.observations,
          installment_type: payable.installmentType,
          installments: payable.installments,
          recurrence_type: payable.recurrenceType,
          recurrence_count: payable.recurrenceCount,
          is_paid: payable.isPaid,
          paid_date: payable.paidDate?.toISOString().split('T')[0],
          parent_id: payable.parentId
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newPayable: PayableAccount = {
          id: data.id,
          supplierId: data.supplier_id,
          categoryId: data.category_id,
          value: Number(data.value),
          dueDate: new Date(data.due_date),
          observations: data.observations || undefined,
          installmentType: data.installment_type as 'unico' | 'parcelado' | 'recorrente',
          installments: data.installments || undefined,
          recurrenceType: data.recurrence_type as 'diario' | 'semanal' | 'quinzenal' | 'mensal' | undefined,
          recurrenceCount: data.recurrence_count || undefined,
          isPaid: data.is_paid,
          paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
          parentId: data.parent_id || undefined,
          createdAt: new Date(data.created_at)
        };
        
        setPayableAccounts(prev => [newPayable, ...prev]);
        toast({
          title: "Sucesso",
          description: "Conta a pagar criada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar",
        variant: "destructive"
      });
    }
  };

  const updatePayableAccount = async (id: string, updates: Partial<PayableAccount>) => {
    try {
      const updateData: any = {};
      
      if (updates.supplierId) updateData.supplier_id = updates.supplierId;
      if (updates.categoryId) updateData.category_id = updates.categoryId;
      if (updates.value !== undefined) updateData.value = updates.value;
      if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
      if (updates.observations !== undefined) updateData.observations = updates.observations;
      if (updates.installmentType) updateData.installment_type = updates.installmentType;
      if (updates.installments !== undefined) updateData.installments = updates.installments;
      if (updates.recurrenceType !== undefined) updateData.recurrence_type = updates.recurrenceType;
      if (updates.recurrenceCount !== undefined) updateData.recurrence_count = updates.recurrenceCount;
      if (updates.isPaid !== undefined) updateData.is_paid = updates.isPaid;
      if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate?.toISOString().split('T')[0];
      if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;

      const { error } = await supabase
        .from('payable_accounts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setPayableAccounts(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );

      toast({
        title: "Sucesso",
        description: "Conta a pagar atualizada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta a pagar",
        variant: "destructive"
      });
    }
  };

  const deletePayableAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payable_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayableAccounts(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Conta a pagar excluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir conta a pagar:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta a pagar",
        variant: "destructive"
      });
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          type: category.type
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCategory: Category = {
          id: data.id,
          name: data.name,
          type: data.type as 'receita' | 'despesa',
          createdAt: new Date(data.created_at)
        };
        
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive"
      });
    }
  };

  const addClientSupplier = async (client: Omit<ClientSupplier, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('clients_suppliers')
        .insert([{
          name: client.name,
          type: client.type,
          observations: client.observations
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newClient: ClientSupplier = {
          id: data.id,
          name: data.name,
          type: data.type as 'cliente' | 'fornecedor',
          observations: data.observations || undefined,
          createdAt: new Date(data.created_at)
        };
        
        setClientsSuppliers(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
        toast({
          title: "Sucesso",
          description: `${client.type === 'cliente' ? 'Cliente' : 'Fornecedor'} criado com sucesso`
        });
      }
    } catch (error) {
      console.error('Erro ao criar cliente/fornecedor:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cliente/fornecedor",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      loading,
      addPayableAccount,
      updatePayableAccount,
      deletePayableAccount,
      addCategory,
      addClientSupplier,
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
