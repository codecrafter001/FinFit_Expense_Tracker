import { ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  onAddExpense: () => void;
}

export default function Header({ onAddExpense }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <ChartLine className="text-emerald-500 h-8 w-8 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">FinFit</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              href="#dashboard"
              className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#expenses"
              className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Expenses
            </a>
            <a
              href="#budget"
              className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Budget
            </a>
            <a
              href="#analytics"
              className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Analytics
            </a>
          </nav>
          <div className="flex items-center">
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={onAddExpense}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
