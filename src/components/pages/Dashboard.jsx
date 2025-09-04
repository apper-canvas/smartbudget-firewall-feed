import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/molecules/StatCard";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrendsChart from "@/components/organisms/SpendingTrendsChart";
import TransactionList from "@/components/organisms/TransactionList";
import BudgetCard from "@/components/molecules/BudgetCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import { budgetAlertService } from "@/services/api/budgetAlertService";
import { format, startOfMonth, endOfMonth } from "date-fns";
const Dashboard = ({ onAddTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [alertSummary, setAlertSummary] = useState(null);
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [transactionData, budgetData, categoryData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        categoryService.getAll()
      ]);
      setTransactions(transactionData);
      setBudgets(budgetData);
      setCategories(categoryData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      if (currentBudget) {
        const summary = await budgetAlertService.getAlertSummary(format(currentMonth, "yyyy-MM"));
        setAlertSummary(summary);
      }
    };
    loadAlerts();
  }, [currentBudget, currentMonth, monthlyExpenses]);

  if (loading) return <Loading text="Loading dashboard..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  // Current month calculations
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = monthlyIncome - monthlyExpenses;

// Get current month budget
  const currentBudget = budgets.find(b => 
    b.month === format(currentMonth, "yyyy-MM")
  );

  const remainingBudget = currentBudget ? currentBudget.totalLimit - monthlyExpenses : 0;

  // Budget breakdown by category
  const categorySpending = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Load budget alerts

  const budgetCards = currentBudget ? 
    Object.entries(currentBudget.categoryLimits).map(([category, budget]) => ({
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
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your financial overview for {format(currentMonth, "MMMM yyyy")}
          </p>
        </div>
        <Button onClick={onAddTransaction}>
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Add Transaction
        </Button>
      </div>
{/* Budget Alerts Section */}
        {alertSummary && alertSummary.totalAlerts > 0 && (
          <motion.div 
            className="col-span-full mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <ApperIcon name="AlertTriangle" size={20} className="mr-2 text-warning" />
                Budget Alerts
              </h2>
              <span className="text-sm text-gray-600">
                {alertSummary.totalAlerts} active alert{alertSummary.totalAlerts !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alertSummary.exceeded > 0 && (
                <StatCard
                  title="Budget Exceeded"
                  value={alertSummary.exceeded}
                  icon="XCircle"
                  variant="critical"
                  alertLevel="exceeded"
                />
              )}
              {alertSummary.critical > 0 && (
                <StatCard
                  title="Critical Alerts"
                  value={alertSummary.critical}
                  icon="AlertCircle"
                  variant="warning"
                  alertLevel="critical"
                />
              )}
              {alertSummary.warning > 0 && (
                <StatCard
                  title="Warning Alerts"
                  value={alertSummary.warning}
                  icon="AlertTriangle"
                  variant="warning"
                  alertLevel="warning"
                />
              )}
            </div>
          </motion.div>
        )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Income"
          value={monthlyIncome}
          icon="TrendingUp"
          trend="up"
          trendValue="+5.2% from last month"
          variant="success"
        />
        <StatCard
          title="Monthly Expenses"
          value={monthlyExpenses}
          icon="TrendingDown"
          trend="down"
          trendValue="-2.1% from last month"
        />
        <StatCard
          title="Net Income"
          value={netIncome}
          icon="DollarSign"
          trend={netIncome >= 0 ? "up" : "down"}
          trendValue={netIncome >= 0 ? "Positive cash flow" : "Negative cash flow"}
          variant={netIncome >= 0 ? "success" : "warning"}
        />
<StatCard
          title="Remaining Budget"
          value={remainingBudget}
          icon="Target"
          trend={remainingBudget >= 0 ? "up" : "down"}
          trendValue={remainingBudget >= 0 ? "Under budget" : "Over budget"}
          variant={remainingBudget >= 0 ? "default" : "warning"}
          alertLevel={remainingBudget < 0 ? "exceeded" : remainingBudget < (currentBudget?.totalLimit * 0.2) ? "critical" : "safe"}
        />
      </div>

      {/* Budget Cards */}
      {budgetCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold gradient-text mb-4">Budget Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetCards.slice(0, 6).map((budget, index) => (
              <BudgetCard
                key={budget.category}
                category={budget.category}
                budget={budget.budget}
                spent={budget.spent}
                color={budget.color}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <SpendingTrendsChart />
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold gradient-text">Recent Transactions</h2>
        </div>
        <TransactionList 
          onEdit={onAddTransaction} 
          showHeader={false} 
          limit={5} 
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;