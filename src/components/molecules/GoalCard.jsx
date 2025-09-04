import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ProgressRing from "@/components/molecules/ProgressRing";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays } from "date-fns";

const GoalCard = ({ goal, onAddFunds, onEdit, onDelete }) => {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
  const isCompleted = progress >= 100;
  const isOverdue = daysLeft < 0 && !isCompleted;

  const getVariant = () => {
    if (isCompleted) return "success";
    if (isOverdue) return "warning";
    return "default";
  };

  const getProgressColor = () => {
    if (isCompleted) return "#22C55E";
    if (isOverdue) return "#F59E0B";
    return "#2563EB";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant={getVariant()} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{goal.name}</h3>
            <p className="text-sm text-gray-600">
              Target: ${goal.targetAmount.toLocaleString()} by {format(new Date(goal.deadline), "MMM dd, yyyy")}
            </p>
          </div>
          <ProgressRing 
            progress={Math.min(progress, 100)} 
            color={getProgressColor()}
            size={70}
            strokeWidth={6}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Amount:</span>
            <span className="font-medium text-gray-800">
              ${goal.currentAmount.toLocaleString()}
            </span>
          </div>

          {!isCompleted && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-medium text-primary">
                ${remaining.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {daysLeft >= 0 ? "Days left:" : "Days overdue:"}
            </span>
            <span className={`font-medium ${isOverdue ? "text-error" : "text-gray-800"}`}>
              {Math.abs(daysLeft)}
            </span>
          </div>
        </div>

        {isCompleted && (
          <motion.div 
            className="flex items-center text-success text-sm mt-3 p-2 bg-success/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ApperIcon name="CheckCircle" size={16} className="mr-2" />
            <span>Goal completed! 🎉</span>
          </motion.div>
        )}

        <div className="flex gap-2 mt-4">
          {!isCompleted && (
            <Button
              size="sm"
              onClick={() => onAddFunds(goal)}
              className="flex-1"
            >
              <ApperIcon name="Plus" size={16} className="mr-1" />
              Add Funds
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(goal)}
            className="px-3"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(goal.id)}
            className="px-3 text-error hover:text-error"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default GoalCard;