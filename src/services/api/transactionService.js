import transactionsData from "@/services/mockData/transactions.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let transactions = [...transactionsData];

export const transactionService = {
  async getAll() {
    await delay(300);
    return [...transactions];
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  },

async create(transactionData) {
    await delay(400);
    const maxId = Math.max(...transactions.map(t => t.id), 0);
    const newTransaction = {
      ...transactionData,
      id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    
    // Trigger budget alert check for expense transactions
    if (transactionData.type === 'expense') {
      // Import here to avoid circular dependency
      const { budgetAlertService } = await import('./budgetAlertService');
      await budgetAlertService.checkThresholdCrossing(newTransaction);
    }
    
    return { ...newTransaction };
  },

async update(id, transactionData) {
    await delay(350);
    const index = transactions.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    transactions[index] = {
      ...transactions[index],
      ...transactionData,
      id: parseInt(id)
    };
    
    // Trigger budget alert check for expense transactions
    if (transactionData.type === 'expense') {
      // Import here to avoid circular dependency
      const { budgetAlertService } = await import('./budgetAlertService');
      await budgetAlertService.checkThresholdCrossing(transactions[index]);
    }
    
    return { ...transactions[index] };
  },

  async delete(id) {
    await delay(250);
    const index = transactions.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    transactions.splice(index, 1);
    return { success: true };
  }
};