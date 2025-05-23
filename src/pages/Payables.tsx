
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PayableForm from "@/components/payables/PayableForm";
import { PayableAccount } from "@/types";

export default function Payables() {
  const { 
    payableAccounts, 
    categories, 
    clientsSuppliers, 
    loading, 
    updatePayableAccount, 
    deletePayableAccount 
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<PayableAccount | null>(null);

  const suppliers = clientsSuppliers.filter(cs => cs.type === 'fornecedor');
  const expenseCategories = categories.filter(cat => cat.type === 'despesa');

  const handleEdit = (payable: PayableAccount) => {
    setEditingPayable(payable);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta a pagar?')) {
      await deletePayableAccount(id);
    }
  };

  const handleMarkAsPaid = async (payable: PayableAccount) => {
    await updatePayableAccount(payable.id, {
      isPaid: true,
      paidDate: new Date()
    });
  };

  const handleMarkAsUnpaid = async (payable: PayableAccount) => {
    await updatePayableAccount(payable.id, {
      isPaid: false,
      paidDate: undefined
    });
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Fornecedor não encontrado';
  };

  const getCategoryName = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (payable: PayableAccount) => {
    if (payable.isPaid) {
      return <Badge variant="default" className="bg-green-500">Pago</Badge>;
    }
    
    const today = new Date();
    const dueDate = new Date(payable.dueDate);
    
    if (dueDate < today) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white">Vence em breve</Badge>;
    } else {
      return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingPayable(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Pagar</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Pagar</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta a Pagar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          {payableAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma conta a pagar cadastrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payableAccounts.map((payable) => (
                  <TableRow key={payable.id}>
                    <TableCell className="font-medium">
                      {getSupplierName(payable.supplierId)}
                    </TableCell>
                    <TableCell>{getCategoryName(payable.categoryId)}</TableCell>
                    <TableCell>{formatCurrency(payable.value)}</TableCell>
                    <TableCell>
                      {format(new Date(payable.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getStatusBadge(payable)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payable.installmentType === 'unico' && 'Único'}
                        {payable.installmentType === 'parcelado' && 'Parcelado'}
                        {payable.installmentType === 'recorrente' && 'Recorrente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!payable.isPaid ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(payable)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsUnpaid(payable)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(payable)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(payable.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <PayableForm
          payable={editingPayable}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPayable(null);
          }}
        />
      )}
    </div>
  );
}
