import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBudgetSchema, type InsertBudget, type Budget } from "@shared/schema";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const form = useForm<InsertBudget>({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      amount: "",
      month: currentMonth,
    },
  });

  // Fetch existing budget for the selected month
  const selectedMonth = form.watch("month");
  const { data: existingBudget } = useQuery<Budget>({
    queryKey: ['/api/budgets/month', selectedMonth],
    enabled: !!selectedMonth && isOpen,
  });

  useEffect(() => {
    if (existingBudget) {
      form.setValue("amount", existingBudget.amount);
    }
  }, [existingBudget, form]);

  const createBudgetMutation = useMutation({
    mutationFn: (data: InsertBudget) => apiRequest('POST', '/api/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets/month'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      toast({ 
        title: existingBudget ? "Budget updated successfully" : "Budget created successfully" 
      });
      handleClose();
    },
    onError: () => {
      toast({ 
        title: existingBudget ? "Failed to update budget" : "Failed to create budget", 
        variant: "destructive" 
      });
    }
  });

  const handleClose = () => {
    form.reset({
      amount: "",
      month: currentMonth,
    });
    onClose();
  };

  const onSubmit = (data: InsertBudget) => {
    createBudgetMutation.mutate(data);
  };

  const isLoading = createBudgetMutation.isPending;

  const formatMonthDisplay = (monthValue: string) => {
    if (!monthValue) return "";
    const date = new Date(monthValue + "-01");
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingBudget ? "Update Monthly Budget" : "Set Monthly Budget"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="4000.00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <p className="text-sm text-gray-600">
                      Budget for {formatMonthDisplay(field.value)}
                      {existingBudget && (
                        <span className="text-amber-600 ml-1">
                          (This will update the existing budget)
                        </span>
                      )}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                disabled={isLoading}
              >
                {isLoading 
                  ? "Saving..." 
                  : existingBudget 
                    ? "Update Budget" 
                    : "Set Budget"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
