import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Wallet, Target, Receipt } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalyticsSummary {
  totalSpent: number;
  budgetAmount: number;
  budgetRemaining: number;
  budgetPercentage: number;
  transactionCount: number;
  month: string;
}

interface OverviewStatsProps {
  showProgress?: boolean;
}

export default function OverviewStats({ showProgress = false }: OverviewStatsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data: summary, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: [`/api/analytics/summary?month=${currentMonth}`],
  });

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (showProgress) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {summary.budgetPercentage}%
            </span>
          </div>
          <Progress value={summary.budgetPercentage} className="h-3" />
          <p className="text-xs text-gray-500 mt-1">
            ${summary.totalSpent.toFixed(2)} of ${summary.budgetAmount.toFixed(2)} spent
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Spent",
      value: `$${summary.totalSpent.toFixed(2)}`,
      icon: TrendingUp,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      change: "+12% from last month",
      changeColor: "text-red-600"
    },
    {
      label: "Budget Remaining",
      value: `$${summary.budgetRemaining.toFixed(2)}`,
      icon: Wallet,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      change: `${Math.round((summary.budgetRemaining / summary.budgetAmount) * 100)}% remaining`,
      changeColor: "text-emerald-600"
    },
    {
      label: "Monthly Budget",
      value: `$${summary.budgetAmount.toFixed(2)}`,
      icon: Target,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      change: "Set for " + new Date().toLocaleDateString('en-US', { month: 'long' }),
      changeColor: "text-gray-600"
    },
    {
      label: "Transactions",
      value: summary.transactionCount.toString(),
      icon: Receipt,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      change: "This month",
      changeColor: "text-gray-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.iconBg} p-3 rounded-full`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm ${stat.changeColor}`}>{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
