import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, trend, trendValue, variant = "default", alertLevel = "safe" }) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-error";
    return "text-gray-500";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "TrendingUp";
    if (trend === "down") return "TrendingDown";
    return "Minus";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
<Card variant={alertLevel === 'exceeded' ? 'critical' : variant} className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {alertLevel !== 'safe' && (
                <div className={`ml-2 w-2 h-2 rounded-full ${
                  alertLevel === 'exceeded' ? 'bg-error' : 
                  alertLevel === 'critical' ? 'bg-warning' : 'bg-yellow-400'
                }`} />
              )}
            </div>
            <p className={`text-3xl font-bold mb-2 ${
              alertLevel === 'exceeded' ? 'text-error' : 
              alertLevel === 'critical' ? 'text-warning' : 'gradient-text'
            }`}>
              {formatValue(value)}
            </p>
            {trendValue && (
              <div className={`flex items-center text-sm ${getTrendColor()}`}>
                <ApperIcon name={getTrendIcon()} size={16} className="mr-1" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
              <ApperIcon name={icon} size={24} className="text-primary" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;