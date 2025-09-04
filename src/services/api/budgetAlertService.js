import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "react-toastify";

// Alert thresholds
const THRESHOLDS = {
  WARNING: 80,
  CRITICAL: 90,
  EXCEEDED: 100
};

// Get alert level based on percentage
const getAlertLevel = (percentage) => {
  if (percentage >= THRESHOLDS.EXCEEDED) return 'exceeded';
  if (percentage >= THRESHOLDS.CRITICAL) return 'critical';
  if (percentage >= THRESHOLDS.WARNING) return 'warning';
  return 'safe';
};

// Get alert message for level
const getAlertMessage = (level, category, amount, budget) => {
  const remaining = budget - amount;
  const overAmount = amount - budget;
  
  switch (level) {
    case 'exceeded':
      return `${category} budget exceeded by $${overAmount.toLocaleString()}`;
    case 'critical':
      return `${category} budget at ${Math.round((amount/budget)*100)}% - Only $${remaining.toLocaleString()} remaining`;
    case 'warning':
      return `${category} budget at ${Math.round((amount/budget)*100)}% - $${remaining.toLocaleString()} remaining`;
    default:
      return null;
  }
};

export const budgetAlertService = {
  // Calculate budget alerts for current month
  async calculateBudgetAlerts(month = format(new Date(), "yyyy-MM")) {
    try {
      const [budgets, transactions] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);

      const currentBudget = budgets.find(b => b.month === month);
      if (!currentBudget) {
        return {
          categoryAlerts: [],
          totalAlert: null,
          summary: { safe: 0, warning: 0, critical: 0, exceeded: 0 }
        };
      }

      // Get current month transactions
      const monthStart = startOfMonth(new Date(month + "-01"));
      const monthEnd = endOfMonth(monthStart);
      
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && 
               transactionDate <= monthEnd && 
               t.type === "expense";
      });

      // Calculate category spending
      const categorySpending = monthlyTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

      // Calculate total spending
      const totalSpending = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Generate category alerts
      const categoryAlerts = Object.entries(currentBudget.categoryLimits)
        .filter(([_, budget]) => budget > 0)
        .map(([category, budget]) => {
          const spent = categorySpending[category] || 0;
          const percentage = (spent / budget) * 100;
          const level = getAlertLevel(percentage);
          
          return {
            category,
            budget,
            spent,
            percentage,
            level,
            message: getAlertMessage(level, category, spent, budget)
          };
        })
        .filter(alert => alert.level !== 'safe');

      // Generate total budget alert
      const totalPercentage = (totalSpending / currentBudget.totalLimit) * 100;
      const totalLevel = getAlertLevel(totalPercentage);
      const totalAlert = totalLevel !== 'safe' ? {
        budget: currentBudget.totalLimit,
        spent: totalSpending,
        percentage: totalPercentage,
        level: totalLevel,
        message: getAlertMessage(totalLevel, "Total", totalSpending, currentBudget.totalLimit)
      } : null;

      // Generate summary
      const allAlerts = [...categoryAlerts];
      if (totalAlert) allAlerts.push(totalAlert);
      
      const summary = allAlerts.reduce((acc, alert) => {
        acc[alert.level] = (acc[alert.level] || 0) + 1;
        return acc;
      }, { safe: 0, warning: 0, critical: 0, exceeded: 0 });

      return {
        categoryAlerts,
        totalAlert,
        summary
      };
    } catch (error) {
      console.error("Error calculating budget alerts:", error);
      return {
        categoryAlerts: [],
        totalAlert: null,
        summary: { safe: 0, warning: 0, critical: 0, exceeded: 0 }
      };
    }
  },

  // Get alert summary for dashboard
  async getAlertSummary(month = format(new Date(), "yyyy-MM")) {
    const alerts = await this.calculateBudgetAlerts(month);
    return {
      totalAlerts: alerts.categoryAlerts.length + (alerts.totalAlert ? 1 : 0),
      criticalAlerts: alerts.summary.critical + alerts.summary.exceeded,
      ...alerts.summary
    };
  },

  // Trigger alert notifications based on new transaction
  async triggerAlertNotifications(transactionData) {
    try {
      const month = format(new Date(transactionData.date), "yyyy-MM");
      const alerts = await this.calculateBudgetAlerts(month);
      
      // Show toast notifications for new critical/exceeded alerts
      alerts.categoryAlerts.forEach(alert => {
        if (alert.level === 'critical' || alert.level === 'exceeded') {
          const toastType = alert.level === 'exceeded' ? 'error' : 'warning';
          toast[toastType](alert.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true
          });
        }
      });

      if (alerts.totalAlert && (alerts.totalAlert.level === 'critical' || alerts.totalAlert.level === 'exceeded')) {
        const toastType = alerts.totalAlert.level === 'exceeded' ? 'error' : 'warning';
        toast[toastType](alerts.totalAlert.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true
        });
      }

      return alerts;
    } catch (error) {
      console.error("Error triggering alert notifications:", error);
      return null;
    }
  },

  // Check if budget threshold was crossed by transaction
  async checkThresholdCrossing(transactionData) {
    try {
      const month = format(new Date(transactionData.date), "yyyy-MM");
      
      // Calculate alerts before and after transaction
      const alertsBefore = await this.calculateBudgetAlerts(month);
      
      // This would be called after transaction is saved
      setTimeout(() => {
        this.triggerAlertNotifications(transactionData);
      }, 500);
      
      return alertsBefore;
    } catch (error) {
      console.error("Error checking threshold crossing:", error);
      return null;
    }
  }
};