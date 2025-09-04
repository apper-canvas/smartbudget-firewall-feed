import { toast } from "react-toastify";

export const transactionService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords("transaction_c", params);
      
      if (!response?.data?.length) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(transaction => ({
        id: transaction.Id,
        type: transaction.type_c,
        amount: transaction.amount_c,
        category: transaction.category_c,
        date: transaction.date_c,
        description: transaction.description_c || transaction.Name,
        createdAt: transaction.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "created_at_c"}}
        ]
      };

      const response = await apperClient.getRecordById("transaction_c", parseInt(id), params);
      
      if (!response?.data) {
        throw new Error("Transaction not found");
      }

      // Transform database fields to match UI expectations
      return {
        id: response.data.Id,
        type: response.data.type_c,
        amount: response.data.amount_c,
        category: response.data.category_c,
        date: response.data.date_c,
        description: response.data.description_c || response.data.Name,
        createdAt: response.data.created_at_c
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      throw new Error("Transaction not found");
    }
  },

  async create(transactionData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: transactionData.description || `${transactionData.type} - ${transactionData.category}`,
          type_c: transactionData.type,
          amount_c: transactionData.amount,
          category_c: transactionData.category,
          date_c: transactionData.date,
          description_c: transactionData.description || "",
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await apperClient.createRecord("transaction_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transactions:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create transaction");
        }

        if (successful.length > 0) {
          const createdTransaction = successful[0].data;
          
          // Trigger budget alert check for expense transactions
          if (transactionData.type === 'expense') {
            try {
              const { budgetAlertService } = await import('./budgetAlertService');
              await budgetAlertService.checkThresholdCrossing({
                ...transactionData,
                id: createdTransaction.Id
              });
            } catch (alertError) {
              console.error("Error checking budget alerts:", alertError);
            }
          }

          return {
            id: createdTransaction.Id,
            type: createdTransaction.type_c,
            amount: createdTransaction.amount_c,
            category: createdTransaction.category_c,
            date: createdTransaction.date_c,
            description: createdTransaction.description_c || createdTransaction.Name,
            createdAt: createdTransaction.created_at_c
          };
        }
      }
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, transactionData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: transactionData.description || `${transactionData.type} - ${transactionData.category}`,
          type_c: transactionData.type,
          amount_c: transactionData.amount,
          category_c: transactionData.category,
          date_c: transactionData.date,
          description_c: transactionData.description || ""
        }]
      };

      const response = await apperClient.updateRecord("transaction_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transactions:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update transaction");
        }

        if (successful.length > 0) {
          const updatedTransaction = successful[0].data;
          
          // Trigger budget alert check for expense transactions
          if (transactionData.type === 'expense') {
            try {
              const { budgetAlertService } = await import('./budgetAlertService');
              await budgetAlertService.checkThresholdCrossing({
                ...transactionData,
                id: parseInt(id)
              });
            } catch (alertError) {
              console.error("Error checking budget alerts:", alertError);
            }
          }

          return {
            id: updatedTransaction.Id,
            type: updatedTransaction.type_c,
            amount: updatedTransaction.amount_c,
            category: updatedTransaction.category_c,
            date: updatedTransaction.date_c,
            description: updatedTransaction.description_c || updatedTransaction.Name,
            createdAt: updatedTransaction.created_at_c
          };
        }
      }
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("transaction_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} transactions:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        return successful.length > 0;
      }
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      return false;
    }
  }
};