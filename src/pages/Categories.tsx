
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { Category } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Categories() {
  const { categories, setCategories } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'receita' | 'despesa',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '' as 'receita' | 'despesa',
    });
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      setCategories(prev => prev.map(category => 
        category.id === editingCategory.id 
          ? {
              ...category,
              name: formData.name,
              type: formData.type,
            }
          : category
      ));
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!"
      });
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        createdAt: new Date(),
      };

      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      setCategories(prev => prev.filter(category => category.id !== id));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!"
      });
    }
  };

  const revenueCategories = categories.filter(cat => cat.type === 'receita');
  const expenseCategories = categories.filter(cat => cat.type === 'despesa');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tertiary">Categorias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Alimentação, Salário..."
                />
              </div>

              <div>
                <Label>Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'receita' | 'despesa') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categorias de Receita */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-600 flex items-center">
            Categorias de Receita
            <Badge variant="outline" className="ml-2">
              {revenueCategories.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {revenueCategories.map(category => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <span className="font-medium">{category.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma categoria de receita cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Categorias de Despesa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600 flex items-center">
            Categorias de Despesa
            <Badge variant="outline" className="ml-2">
              {expenseCategories.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expenseCategories.map(category => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <span className="font-medium">{category.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma categoria de despesa cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma categoria cadastrada ainda.</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Nova Categoria" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
