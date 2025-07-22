import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart, registerables } from "chart.js";
import type { Expense } from "@shared/schema";

Chart.register(...registerables);

interface AnalyticsSummary {
  totalSpent: number;
  budgetAmount: number;
  budgetRemaining: number;
  budgetPercentage: number;
  transactionCount: number;
  categoryTotals: Record<string, number>;
  month: string;
}

export default function AnalyticsCharts() {
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const budgetChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: [`/api/analytics/summary?month=${currentMonth}`],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  useEffect(() => {
    // Cleanup existing charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    if (!summary || !categoryChartRef.current || !trendChartRef.current || !budgetChartRef.current) {
      return;
    }

    // Category Chart Data
    const categoryData = {
      labels: Object.keys(summary.categoryTotals).map(key => {
        const categoryMap: Record<string, string> = {
          food: 'Food',
          transport: 'Transport',
          entertainment: 'Entertainment',
          utilities: 'Utilities',
          shopping: 'Shopping',
          healthcare: 'Healthcare',
          other: 'Other',
        };
        return categoryMap[key] || key;
      }),
      datasets: [{
        data: Object.values(summary.categoryTotals),
        backgroundColor: [
          '#10B981', // emerald-500
          '#3B82F6', // blue-500
          '#8B5CF6', // purple-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#EC4899', // pink-500
          '#6B7280', // gray-500
        ],
        borderWidth: 0
      }]
    };

    // Trend Chart Data (last 6 months)
    const last6Months = [];
    const monthlyTotals = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      last6Months.push(date.toLocaleDateString('en-US', { month: 'short' }));
      
      const monthExpenses = expenses.filter(expense => expense.date.startsWith(monthKey));
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      monthlyTotals.push(monthTotal);
    }

    const trendData = {
      labels: last6Months,
      datasets: [{
        label: 'Spending',
        data: monthlyTotals,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3
      }]
    };

    // Budget vs Actual Chart Data
    const budgetData = {
      labels: last6Months,
      datasets: [{
        label: 'Budget',
        data: new Array(6).fill(summary.budgetAmount),
        backgroundColor: '#E5E7EB',
        borderColor: '#9CA3AF',
        borderWidth: 1
      }, {
        label: 'Actual',
        data: monthlyTotals,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };

    // Create Category Chart (Doughnut)
    const categoryChart = new Chart(categoryChartRef.current, {
      type: 'doughnut',
      data: categoryData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });

    // Create Trend Chart (Line)
    const trendChart = new Chart(trendChartRef.current, {
      type: 'line',
      data: trendData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    // Create Budget Chart (Bar)
    const budgetChart = new Chart(budgetChartRef.current, {
      type: 'bar',
      data: budgetData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    chartInstances.current = [categoryChart, trendChart, budgetChart];

    return () => {
      chartInstances.current.forEach(chart => chart.destroy());
      chartInstances.current = [];
    };
  }, [summary, expenses]);

  if (!summary) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Spending by Category Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <div className="h-64">
          <canvas ref={categoryChartRef} className="w-full h-full"></canvas>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
        <div className="h-64">
          <canvas ref={trendChartRef} className="w-full h-full"></canvas>
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Spending</h3>
        <div className="h-64">
          <canvas ref={budgetChartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );
}
