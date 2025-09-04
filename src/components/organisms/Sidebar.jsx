import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Transactions", href: "/transactions", icon: "Receipt" },
    { name: "Budgets", href: "/budgets", icon: "Target" },
    { name: "Goals", href: "/goals", icon: "TrendingUp" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
  ];

  const NavItems = () => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                : "text-gray-600 hover:text-primary hover:bg-primary/10"
            }`
          }
          onClick={() => setIsMobileOpen(false)}
        >
          <ApperIcon 
            name={item.icon} 
            size={20} 
            className="mr-3 transition-transform duration-200 group-hover:scale-110" 
          />
          <span className="font-medium">{item.name}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <ApperIcon 
          name={isMobileOpen ? "X" : "Menu"} 
          size={20} 
          className="text-gray-700" 
        />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white/90 backdrop-blur-sm border-r border-white/20 min-h-screen">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-3">
              <ApperIcon name="Wallet" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SmartBudget</h1>
          </div>

          <nav className="space-y-2">
            <NavItems />
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="lg:hidden fixed left-0 top-0 z-50 w-64 h-full bg-white/95 backdrop-blur-md border-r border-white/30 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-3">
                    <ApperIcon name="Wallet" size={24} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold gradient-text">SmartBudget</h1>
                </div>

                <nav className="space-y-2">
                  <NavItems />
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;