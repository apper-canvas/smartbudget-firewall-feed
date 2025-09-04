import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

const SpendingTrendsChart = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading) return <Loading text="Loading spending trends..." />;
  if (error) return <Error message={error} onRetry={loadTransactions} />;

  if (transactions.length === 0) {
    return (
      <Empty 
        title="No spending data"
        message="Add transactions to see your spending trends"
        icon="TrendingUp"
      />
    );
  }

  // Get last 6 months
  const endDate = new Date();
  const startDate = subMonths(endDate, 5);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  // Calculate monthly totals
  const monthlyData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(month, "MMM yyyy"),
      income,
      expenses,
      net: income - expenses
    };
  });

  const categories = monthlyData.map(d => d.month);
  const incomeData = monthlyData.map(d => d.income);
  const expenseData = monthlyData.map(d => d.expenses);
  const netData = monthlyData.map(d => d.net);

  const chartOptions = {
    chart: {
      type: "line",
      height: 350,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800
      },
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px"
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return "$" + Math.round(val).toLocaleString();
        },
        style: {
          fontSize: "12px"
        }
      }
    },
    colors: ["#10B981", "#EF4444", "#2563EB"],
    stroke: {
      width: 3,
      curve: "smooth"
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px"
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return "$" + val.toLocaleString();
        }
      }
    },
    grid: {
      strokeDashArray: 3,
      borderColor: "#e5e7eb"
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      hover: {
        size: 8
      }
    }
  };

  const series = [
    {
      name: "Income",
      data: incomeData
    },
    {
      name: "Expenses",
      data: expenseData
    },
    {
      name: "Net",
      data: netData
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-xl font-bold gradient-text mb-6">Spending Trends</h3>
        <div className="h-80">
          <Chart
            options={chartOptions}
            series={series}
            type="line"
            height="100%"
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default SpendingTrendsChart;