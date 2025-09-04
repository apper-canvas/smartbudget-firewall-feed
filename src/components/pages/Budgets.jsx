import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import BudgetCard from "@/components/molecules/BudgetCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import { transactionService } from "@/services/api/transactionService";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "react-toastify";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [budgetForm, setBudgetForm] = useState({
    totalLimit: "",
    categoryLimits: {}
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [budgetData, categoryData, transactionData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
        transactionService.getAll()
      ]);
      setBudgets(budgetData);
      setCategories(categoryData);
      setTransactions(transactionData);
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Load existing budget for selected month
    const existingBudget = budgets.find(b => b.month === selectedMonth);
    if (existingBudget) {
      setBudgetForm({
        totalLimit: existingBudget.totalLimit.toString(),
        categoryLimits: { ...existingBudget.categoryLimits }
      });
    } else {
      setBudgetForm({
        totalLimit: "",
        categoryLimits: {}
      });
    }
  }, [selectedMonth, budgets]);

  if (loading) return <Loading text="Loading budgets..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const expenseCategories = categories.filter(cat => cat.type === "expense");
  const currentBudget = budgets.find(b => b.month === selectedMonth);

  // Calculate spending for selected month
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd && t.type === "expense";
  });

  const categorySpending = monthTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const handleCategoryLimitChange = (categoryName, value) => {
    setBudgetForm(prev => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [categoryName]: parseFloat(value) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!budgetForm.totalLimit || parseFloat(budgetForm.totalLimit) <= 0) {
      toast.error("Please enter a valid total budget limit");
      return;
    }

    const budgetData = {
      month: selectedMonth,
      year: parseInt(selectedMonth.split("-")[0]),
      totalLimit: parseFloat(budgetForm.totalLimit),
      categoryLimits: budgetForm.categoryLimits
    };

    try {
      if (currentBudget) {
        await budgetService.update(currentBudget.id, budgetData);
        toast.success("Budget updated successfully");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully");
      }
      
      await loadData();
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to save budget");
    }
  };

  const budgetCards = currentBudget ? 
    Object.entries(currentBudget.categoryLimits)
      .filter(([_, budget]) => budget > 0)
      .map(([category, budget]) => ({
        category,
        budget,
        spent: categorySpending[category] || 0,
        color: categories.find(c => c.name === category)?.color || "#2563EB"
      })) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Budgets</h1>
          <p className="text-gray-600 mt-1">
            Set and track your spending limits by category
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - 6 + i);
              const value = format(date, "yyyy-MM");
              return (
                <option key={value} value={value}>
                  {format(date, "MMMM yyyy")}
                </option>
              );
            })}
          </Select>
          <Button onClick={() => setShowForm(!showForm)}>
            <ApperIcon name={showForm ? "X" : "Plus"} size={20} className="mr-2" />
            {showForm ? "Cancel" : currentBudget ? "Edit Budget" : "Set Budget"}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold gradient-text mb-6">
                {currentBudget ? "Edit" : "Set"} Budget for {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Total Monthly Budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetForm.totalLimit}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, totalLimit: e.target.value }))}
                  placeholder="Enter total budget limit"
                  required
                />

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Category Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenseCategories.map(category => (
                      <div key={category.id} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <ApperIcon 
                            name={category.icon} 
                            size={16} 
                            style={{ color: category.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {category.name}
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={budgetForm.categoryLimits[category.name] || ""}
                            onChange={(e) => handleCategoryLimitChange(category.name, e.target.value)}
                            placeholder="0"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {currentBudget ? "Update Budget" : "Create Budget"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="budget-cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {budgetCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetCards.map(budget => (
                  <BudgetCard
                    key={budget.category}
                    category={budget.category}
                    budget={budget.budget}
                    spent={budget.spent}
                    color={budget.color}
                  />
                ))}
              </div>
            ) : (
              <Empty
                title="No budget set"
                message={`Set up your budget for ${format(new Date(selectedMonth + "-01"), "MMMM yyyy")} to start tracking your spending`}
                actionText="Set Budget"
                onAction={() => setShowForm(true)}
                icon="Target"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Budgets;