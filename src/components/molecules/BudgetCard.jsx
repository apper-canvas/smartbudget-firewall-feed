import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";

const BudgetCard = ({ category, budget, spent, color }) => {
const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOverBudget = percentage > 100;
  const isCritical = percentage >= 90;
  const isWarning = percentage >= 80;

  const getVariant = () => {
    if (isOverBudget) return "critical";
    if (isCritical) return "warning";
    if (isWarning) return "warning";
    return "default";
  };

  const getProgressColor = () => {
    if (isOverBudget) return "#EF4444";
    if (isCritical) return "#F59E0B";
    if (isWarning) return "#F59E0B";
    return color || "#2563EB";
  };

  const getAlertIcon = () => {
    if (isOverBudget) return "XCircle";
    if (isCritical) return "AlertCircle";
    if (isWarning) return "AlertTriangle";
    return null;
  };

  const getAlertMessage = () => {
    if (isOverBudget) return `Over budget by $${(spent - budget).toLocaleString()}`;
    if (isCritical) return `Critical: Only $${Math.max(0, remaining).toLocaleString()} remaining`;
    if (isWarning) return `Warning: $${remaining.toLocaleString()} remaining`;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant={getVariant()} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
          <ProgressRing 
            progress={Math.min(percentage, 100)} 
            color={getProgressColor()}
            size={60}
            strokeWidth={6}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent:</span>
            <span className={`font-medium ${isOverBudget ? "text-error" : "text-gray-800"}`}>
              ${spent.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium text-gray-800">
              ${budget.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining:</span>
            <span className={`font-medium ${remaining < 0 ? "text-error" : "text-success"}`}>
              ${Math.abs(remaining).toLocaleString()} {remaining < 0 ? "over" : "left"}
            </span>
          </div>
        </div>
        
{(isWarning || isCritical || isOverBudget) && (
          <motion.div 
            className={`flex items-center text-sm mt-3 p-2 rounded-lg ${
              isOverBudget 
                ? 'text-error bg-error/10' 
                : isCritical 
                ? 'text-warning bg-warning/10'
                : 'text-warning bg-warning/10'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ApperIcon name={getAlertIcon()} size={16} className="mr-2" />
            <span>{getAlertMessage()}</span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default BudgetCard;