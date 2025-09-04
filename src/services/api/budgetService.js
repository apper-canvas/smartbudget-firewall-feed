import budgetsData from "@/services/mockData/budgets.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let budgets = [...budgetsData];

export const budgetService = {
  async getAll() {
    await delay(300);
    return [...budgets];
  },

  async getById(id) {
    await delay(200);
    const budget = budgets.find(b => b.id === parseInt(id));
    if (!budget) {
      throw new Error("Budget not found");
    }
    return { ...budget };
  },

  async create(budgetData) {
    await delay(400);
    const maxId = Math.max(...budgets.map(b => b.id), 0);
    const newBudget = {
      ...budgetData,
      id: maxId + 1
    };
    budgets.push(newBudget);
    return { ...newBudget };
  },

  async update(id, budgetData) {
    await delay(350);
    const index = budgets.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }
    
    budgets[index] = {
      ...budgets[index],
      ...budgetData,
      id: parseInt(id)
    };
    return { ...budgets[index] };
  },

  async delete(id) {
    await delay(250);
    const index = budgets.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }
    
    budgets.splice(index, 1);
    return { success: true };
  }
};