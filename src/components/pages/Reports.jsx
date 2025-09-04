import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import StatCard from "@/components/molecules/StatCard";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrendsChart from "@/components/organisms/SpendingTrendsChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportPeriod, setReportPeriod] = useState("current-month");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [transactionData, categoryData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (err) {
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading text="Loading reports..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  // Get date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    
    switch (reportPeriod) {
      case "current-month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "current-year":
        return { start: startOfYear(now), end: endOfYear(now) };
      case "last-year":
        const lastYear = subYears(now, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();
  
  // Filter transactions for selected period
  const periodTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  // Calculate statistics
  const totalIncome = periodTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = periodTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

  // Top spending categories
  const categorySpending = periodTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Transaction count
  const totalTransactions = periodTransactions.length;
  const averageTransactionAmount = totalTransactions > 0 
    ? (totalIncome + totalExpenses) / totalTransactions 
    : 0;

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case "current-month":
        return format(new Date(), "MMMM yyyy");
      case "last-month":
        return format(new Date(new Date().getFullYear(), new Date().getMonth() - 1), "MMMM yyyy");
      case "current-year":
        return format(new Date(), "yyyy");
      case "last-year":
        return format(subYears(new Date(), 1), "yyyy");
      default:
        return "";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reports</h1>
          <p className="text-gray-600 mt-1">
            Analyze your financial patterns and performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="w-48"
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-year">Current Year</option>
            <option value="last-year">Last Year</option>
          </Select>
        </div>
      </div>

      {/* Period Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">
            {getPeriodLabel()} Summary
          </h2>
          <p className="text-gray-600">
            Financial overview for the selected period
          </p>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={totalIncome}
          icon="TrendingUp"
          trend="up"
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          icon="TrendingDown"
          trend="down"
        />
        <StatCard
          title="Net Income"
          value={netIncome}
          icon="DollarSign"
          trend={netIncome >= 0 ? "up" : "down"}
          variant={netIncome >= 0 ? "success" : "warning"}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon="Target"
          trend={savingsRate > 20 ? "up" : savingsRate > 10 ? "neutral" : "down"}
          variant={savingsRate > 20 ? "success" : "default"}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Transactions"
          value={totalTransactions}
          icon="Receipt"
        />
        <StatCard
          title="Average Transaction"
          value={averageTransactionAmount}
          icon="Calculator"
        />
        <StatCard
          title="Active Categories"
          value={Object.keys(categorySpending).length}
          icon="Grid3x3"
        />
      </div>

      {/* Top Spending Categories */}
      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-bold gradient-text mb-6">Top Spending Categories</h3>
            <div className="space-y-4">
              {topCategories.map(([category, amount], index) => {
                const categoryData = categories.find(c => c.name === category);
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${categoryData?.color || "#2563EB"}20` }}
                      >
                        <ApperIcon 
                          name={categoryData?.icon || "Circle"} 
                          size={20} 
                          style={{ color: categoryData?.color || "#2563EB" }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{category}</h4>
                        <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of expenses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${amount.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <SpendingTrendsChart />
      </div>
    </div>
  );
};

export default Reports;