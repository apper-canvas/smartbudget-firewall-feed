import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Dashboard from "@/components/pages/Dashboard";
import Transactions from "@/components/pages/Transactions";
import Budgets from "@/components/pages/Budgets";
import Goals from "@/components/pages/Goals";
import Reports from "@/components/pages/Reports";
import TransactionForm from "@/components/molecules/TransactionForm";
import { categoryService } from "@/services/api/categoryService";
import { transactionService } from "@/services/api/transactionService";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

function AppContent() {
  const navigate = useNavigate();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [categories, setCategories] = useState([]);

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
    setShowTransactionForm(true);
  };

  const handleSubmitTransaction = async (transactionData) => {
    try {
      await transactionService.create(transactionData);
      toast.success("Transaction added successfully");
      setShowTransactionForm(false);
      // Refresh current page data by forcing a re-render
      window.location.reload();
    } catch (err) {
      toast.error("Failed to add transaction");
    }
  };

  const handleCancelTransaction = () => {
    setShowTransactionForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-0">
          <AnimatePresence mode="wait">
            {showTransactionForm ? (
              <motion.div
                key="transaction-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <TransactionForm
                  onSubmit={handleSubmitTransaction}
                  onCancel={handleCancelTransaction}
                  categories={categories}
                />
              </motion.div>
            ) : (
              <motion.div
                key="main-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard onAddTransaction={handleAddTransaction} />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;