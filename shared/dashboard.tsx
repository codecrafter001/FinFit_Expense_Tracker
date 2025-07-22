import { useState } from "react";
import Header from "@/components/header";
import OverviewStats from "@/components/overview-stats";
import ExpenseTable from "@/components/expense-table";
import AnalyticsCharts from "@/components/analytics-charts";
import ExpenseModal from "@/components/expense-modal";
import BudgetModal from "@/components/budget-modal";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Expense } from "@shared/schema";

export default function Dashboard() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddExpense={() => setIsExpenseModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Overview</h2>
            <p className="text-gray-600">Track your spending and budget progress</p>
          </div>

          <OverviewStats />

          {/* Budget Progress & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
              <OverviewStats showProgress />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-dashed hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() => setIsExpenseModalOpen(true)}
                >
                  <Plus className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Add Expense</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-dashed hover:border-indigo-300 hover:bg-indigo-50"
                  onClick={() => setIsBudgetModalOpen(true)}
                >
                  <Target className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Set Budget</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Expense Management */}
        <section className="mb-12">
          <ExpenseTable
            expenses={expenses}
            onEditExpense={handleEditExpense}
          />
        </section>

        {/* Analytics Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
            <p className="text-gray-600">Visualize your spending patterns and trends</p>
          </div>

          <AnalyticsCharts />
        </section>
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        expense={editingExpense}
      />
      
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden bg-emerald-500 hover:bg-emerald-600"
        onClick={() => setIsExpenseModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
