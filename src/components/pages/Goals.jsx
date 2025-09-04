import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import GoalCard from "@/components/molecules/GoalCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { goalService } from "@/services/api/goalService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setGoalForm({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
    });
    setShowForm(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: format(new Date(goal.deadline), "yyyy-MM-dd")
    });
    setShowForm(true);
  };

  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    
    if (!goalForm.name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    
    if (!goalForm.targetAmount || parseFloat(goalForm.targetAmount) <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    const goalData = {
      name: goalForm.name.trim(),
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: parseFloat(goalForm.currentAmount) || 0,
      deadline: goalForm.deadline
    };

    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id, goalData);
        toast.success("Goal updated successfully");
      } else {
        await goalService.create(goalData);
        toast.success("Goal created successfully");
      }
      
      await loadGoals();
      setShowForm(false);
      setEditingGoal(null);
    } catch (err) {
      toast.error(editingGoal ? "Failed to update goal" : "Failed to create goal");
    }
  };

  const handleAddFunds = (goal) => {
    setShowAddFunds(goal);
    setAddFundsAmount("");
  };

  const handleSubmitAddFunds = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(addFundsAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const updatedGoal = {
        ...showAddFunds,
        currentAmount: showAddFunds.currentAmount + amount
      };
      
      await goalService.update(showAddFunds.id, updatedGoal);
      toast.success(`$${amount.toLocaleString()} added to ${showAddFunds.name}`);
      
      await loadGoals();
      setShowAddFunds(null);
      setAddFundsAmount("");
    } catch (err) {
      toast.error("Failed to add funds");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await goalService.delete(goalId);
        setGoals(prev => prev.filter(g => g.id !== goalId));
        toast.success("Goal deleted successfully");
      } catch (err) {
        toast.error("Failed to delete goal");
      }
    }
  };

  if (loading) return <Loading text="Loading goals..." />;
  if (error) return <Error message={error} onRetry={loadGoals} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Savings Goals</h1>
          <p className="text-gray-600 mt-1">
            Set and track your financial goals
          </p>
        </div>
        {!showForm && !showAddFunds && (
          <Button onClick={handleAddGoal}>
            <ApperIcon name="Plus" size={20} className="mr-2" />
            Add Goal
          </Button>
        )}
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
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </h3>
              
              <form onSubmit={handleSubmitGoal} className="space-y-4">
                <Input
                  label="Goal Name"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Emergency Fund, Vacation, New Car..."
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Target Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="10000"
                    required
                  />
                  
                  <Input
                    label="Current Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <Input
                  label="Target Date"
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : showAddFunds ? (
          <motion.div
            key="add-funds"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold gradient-text mb-6">
                Add Funds to {showAddFunds.name}
              </h3>
              
              <form onSubmit={handleSubmitAddFunds} className="space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current Progress:</span>
                    <span>
                      ${showAddFunds.currentAmount.toLocaleString()} / ${showAddFunds.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((showAddFunds.currentAmount / showAddFunds.targetAmount) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <Input
                  label="Amount to Add"
                  type="number"
                  step="0.01"
                  min="0"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  placeholder="100"
                  required
                />

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    Add Funds
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowAddFunds(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="goals-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onAddFunds={handleAddFunds}
                    onEdit={handleEditGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            ) : (
              <Empty
                title="No goals yet"
                message="Start building your financial future by setting your first savings goal"
                actionText="Create Goal"
                onAction={handleAddGoal}
                icon="Target"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;