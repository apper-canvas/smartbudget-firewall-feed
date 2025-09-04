import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";

const ExpenseChart = () => {
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

  if (loading) return <Loading text="Loading expense breakdown..." />;
  if (error) return <Error message={error} onRetry={loadTransactions} />;

  const expenses = transactions.filter(t => t.type === "expense");
  
  if (expenses.length === 0) {
    return (
      <Empty 
        title="No expenses yet"
        message="Start tracking your spending to see the breakdown"
        icon="PieChart"
      />
    );
  }

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {});

  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  const chartOptions = {
    chart: {
      type: "pie",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      },
      toolbar: {
        show: false
      }
    },
    labels: categories,
    colors: [
      "#2563EB", "#7C3AED", "#10B981", "#F59E0B", 
      "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16",
      "#F97316", "#EC4899"
    ],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        radius: 6
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return Math.round(val) + "%";
      },
      style: {
        fontSize: "12px",
        fontWeight: "600"
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return "$" + val.toLocaleString();
        }
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "0%"
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-xl font-bold gradient-text mb-6">Expense Breakdown</h3>
        <div className="h-80">
          <Chart
            options={chartOptions}
            series={amounts}
            type="pie"
            height="100%"
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default ExpenseChart;