import { expenses, budgets, type Expense, type InsertExpense, type Budget, type InsertBudget } from "@shared/schema";

export interface IStorage {
  // Expense operations
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  
  // Budget operations
  getBudgets(): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  getBudgetByMonth(month: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private expenses: Map<number, Expense>;
  private budgets: Map<number, Budget>;
  private expenseCurrentId: number;
  private budgetCurrentId: number;

  constructor() {
    this.expenses = new Map();
    this.budgets = new Map();
    this.expenseCurrentId = 1;
    this.budgetCurrentId = 1;
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseCurrentId++;
    const expense: Expense = { 
      ...insertExpense,
      notes: insertExpense.notes || null,
      id,
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existing = this.expenses.get(id);
    if (!existing) return undefined;
    
    const updated: Expense = { ...existing, ...updateData };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const allExpenses = await this.getExpenses();
    return allExpenses.filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    const allExpenses = await this.getExpenses();
    return allExpenses.filter(expense => expense.category === category);
  }

  // Budget operations
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values()).sort((a, b) => 
      b.month.localeCompare(a.month)
    );
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async getBudgetByMonth(month: string): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(budget => budget.month === month);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    // Check if budget for this month already exists and replace it
    const existing = await this.getBudgetByMonth(insertBudget.month);
    if (existing) {
      const updated = await this.updateBudget(existing.id, insertBudget);
      return updated!;
    }

    const id = this.budgetCurrentId++;
    const budget: Budget = {
      ...insertBudget,
      id,
      createdAt: new Date()
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updateData: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing) return undefined;
    
    const updated: Budget = { ...existing, ...updateData };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
}

export const storage = new MemStorage();
