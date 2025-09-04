import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import TransactionList from "@/components/organisms/TransactionList";
import TransactionForm from "@/components/molecules/TransactionForm";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { toast } from "react-toastify";
import { useEffect } from "react";

const Transactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSubmitTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, transactionData);
        toast.success("Transaction updated successfully");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully");
      }
      setShowForm(false);
      setEditingTransaction(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(editingTransaction ? "Failed to update transaction" : "Failed to add transaction");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Transactions</h1>
          <p className="text-gray-600 mt-1">
            Manage all your income and expenses
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleAddTransaction}>
            <ApperIcon name="Plus" size={20} className="mr-2" />
            Add Transaction
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
            <TransactionForm
              onSubmit={handleSubmitTransaction}
              onCancel={handleCancel}
              categories={categories}
              initialData={editingTransaction}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TransactionList 
              key={refreshKey}
              onEdit={handleEditTransaction}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;