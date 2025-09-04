import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";

const BudgetCard = ({ category, budget, spent, color }) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOverBudget = percentage > 100;

  const getVariant = () => {
    if (isOverBudget) return "warning";
    if (percentage > 80) return "warning";
    return "default";
  };

  const getProgressColor = () => {
    if (isOverBudget) return "#EF4444";
    if (percentage > 80) return "#F59E0B";
    return color || "#2563EB";
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
        
        {isOverBudget && (
          <motion.div 
            className="flex items-center text-error text-sm mt-3 p-2 bg-error/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ApperIcon name="AlertTriangle" size={16} className="mr-2" />
            <span>Over budget by ${(spent - budget).toLocaleString()}</span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default BudgetCard;