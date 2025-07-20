import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Utensils, Car, Film, Zap, ShoppingBag, Heart, MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Expense, EXPENSE_CATEGORIES } from "@shared/schema";

interface ExpenseTableProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
}

const categoryIcons = {
  food: Utensils,
  transport: Car,
  entertainment: Film,
  utilities: Zap,
  shopping: ShoppingBag,
  healthcare: Heart,
  other: MoreHorizontal,
};

const categoryColors = {
  food: "bg-green-100 text-green-800",
  transport: "bg-blue-100 text-blue-800",
  entertainment: "bg-purple-100 text-purple-800",
  utilities: "bg-yellow-100 text-yellow-800",
  shopping: "bg-pink-100 text-pink-800",
  healthcare: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

export default function ExpenseTable({ expenses, onEditExpense }: ExpenseTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      toast({ title: "Expense deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete expense", variant: "destructive" });
    }
  });

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = !categoryFilter || categoryFilter === "all" || expense.category === categoryFilter;
    const matchesDate = !dateFilter || expense.date === dateFilter;
    return matchesCategory && matchesDate;
  });

  // Paginate expenses
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteExpense = (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const formatCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      food: "Food",
      transport: "Transport",
      entertainment: "Entertainment",
      utilities: "Utilities",
      shopping: "Shopping",
      healthcare: "Healthcare",
      other: "Other",
    };
    return categoryMap[category] || category;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Expenses</h2>
        <div className="flex space-x-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(["food", "transport", "entertainment", "utilities", "shopping", "healthcare", "other"] as const).map(category => (
                <SelectItem key={category} value={category}>
                  {formatCategoryName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expenses found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or add your first expense</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedExpenses.map((expense) => {
                    const CategoryIcon = categoryIcons[expense.category as keyof typeof categoryIcons];
                    const categoryColor = categoryColors[expense.category as keyof typeof categoryColors];
                    
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                          {expense.notes && (
                            <div className="text-sm text-gray-500">{expense.notes}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {formatCategoryName(expense.category)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tabular-nums">
                          ${parseFloat(expense.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                            onClick={() => onEditExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteExpense(expense.id)}
                            disabled={deleteExpenseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredExpenses.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredExpenses.length}</span> results
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
