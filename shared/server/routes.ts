import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertBudgetSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { category, startDate, endDate } = req.query;
      
      let expenses;
      if (category && typeof category === 'string') {
        expenses = await storage.getExpensesByCategory(category);
      } else if (startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
        expenses = await storage.getExpensesByDateRange(startDate, endDate);
      } else {
        expenses = await storage.getExpenses();
      }
      
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid expense data", error });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      
      const expense = await storage.updateExpense(id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid expense data", error });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.get("/api/budgets/month/:month", async (req, res) => {
    try {
      const month = req.params.month;
      const budget = await storage.getBudgetByMonth(month);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found for this month" });
      }
      
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid budget data", error });
      }
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      
      const budget = await storage.updateBudget(id, validatedData);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid budget data", error });
      }
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBudget(id);
      
      if (!success) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const { month } = req.query;
      
      // Get current month if not specified
      const targetMonth = typeof month === 'string' ? month : new Date().toISOString().slice(0, 7);
      
      // Get expenses for the month
      const startDate = `${targetMonth}-01`;
      const endDate = `${targetMonth}-31`;
      const monthlyExpenses = await storage.getExpensesByDateRange(startDate, endDate);
      
      // Get budget for the month
      const budget = await storage.getBudgetByMonth(targetMonth);
      
      // Calculate totals
      const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const budgetAmount = budget ? parseFloat(budget.amount) : 0;
      const budgetRemaining = budgetAmount - totalSpent;
      const budgetPercentage = budgetAmount > 0 ? Math.round((totalSpent / budgetAmount) * 100) : 0;
      
      // Category breakdown
      const categoryTotals: Record<string, number> = {};
      monthlyExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
      });
      
      res.json({
        totalSpent,
        budgetAmount,
        budgetRemaining,
        budgetPercentage,
        transactionCount: monthlyExpenses.length,
        categoryTotals,
        month: targetMonth
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
