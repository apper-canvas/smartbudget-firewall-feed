import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const TransactionList = ({ onEdit, showHeader = true, limit = null }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: ""
  });

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
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.delete(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast.success("Transaction deleted successfully");
      } catch (err) {
        toast.error("Failed to delete transaction");
      }
    }
  };

  if (loading) return <Loading text="Loading transactions..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  // Filter transactions
  let filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) || 
                          transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || transaction.category === filters.category;
    const matchesType = !filters.type || transaction.type === filters.type;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply limit if specified
  if (limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }

  if (transactions.length === 0) {
    return (
      <Empty 
        title="No transactions yet"
        message="Start by adding your first transaction"
        icon="Receipt"
      />
    );
  }

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || "Circle";
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || "#2563EB";
  };

  return (
    <Card className="p-6">
      {showHeader && (
        <div className="mb-6">
          <h3 className="text-xl font-bold gradient-text mb-4">Transactions</h3>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            
            <Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <Empty 
          title="No matching transactions"
          message="Try adjusting your search filters"
          icon="Search"
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/20 hover:bg-white/70 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                  >
                    <ApperIcon 
                      name={getCategoryIcon(transaction.category)} 
                      size={20} 
                      style={{ color: getCategoryColor(transaction.category) }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {transaction.description || transaction.category}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transaction.category} • {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${
                    transaction.type === "income" ? "text-success" : "text-gray-800"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-error hover:text-error"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};

export default TransactionList;