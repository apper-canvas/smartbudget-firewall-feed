import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

export const budgetService = {
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
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}},
          {"field": {"Name": "total_limit_c"}},
          {"field": {"Name": "category_limits_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords("budget_c", params);
      
      if (!response?.data?.length) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(budget => ({
        id: budget.Id,
        month: budget.month_c,
        year: budget.year_c,
        totalLimit: budget.total_limit_c,
        categoryLimits: budget.category_limits_c ? JSON.parse(budget.category_limits_c) : {}
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
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
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}},
          {"field": {"Name": "total_limit_c"}},
          {"field": {"Name": "category_limits_c"}}
        ]
      };

      const response = await apperClient.getRecordById("budget_c", parseInt(id), params);
      
      if (!response?.data) {
        throw new Error("Budget not found");
      }

      // Transform database fields to match UI expectations
      return {
        id: response.data.Id,
        month: response.data.month_c,
        year: response.data.year_c,
        totalLimit: response.data.total_limit_c,
        categoryLimits: response.data.category_limits_c ? JSON.parse(response.data.category_limits_c) : {}
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      throw new Error("Budget not found");
    }
  },

  async create(budgetData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: `Budget for ${budgetData.month}`,
          month_c: budgetData.month,
          year_c: budgetData.year,
          total_limit_c: budgetData.totalLimit,
          category_limits_c: JSON.stringify(budgetData.categoryLimits || {})
        }]
      };

      const response = await apperClient.createRecord("budget_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} budgets:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create budget");
        }

        if (successful.length > 0) {
          const createdBudget = successful[0].data;
          return {
            id: createdBudget.Id,
            month: createdBudget.month_c,
            year: createdBudget.year_c,
            totalLimit: createdBudget.total_limit_c,
            categoryLimits: createdBudget.category_limits_c ? JSON.parse(createdBudget.category_limits_c) : {}
          };
        }
      }
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, budgetData) {
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
          Name: `Budget for ${budgetData.month}`,
          month_c: budgetData.month,
          year_c: budgetData.year,
          total_limit_c: budgetData.totalLimit,
          category_limits_c: JSON.stringify(budgetData.categoryLimits || {})
        }]
      };

      const response = await apperClient.updateRecord("budget_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} budgets:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update budget");
        }

        if (successful.length > 0) {
          const updatedBudget = successful[0].data;
          return {
            id: updatedBudget.Id,
            month: updatedBudget.month_c,
            year: updatedBudget.year_c,
            totalLimit: updatedBudget.total_limit_c,
            categoryLimits: updatedBudget.category_limits_c ? JSON.parse(updatedBudget.category_limits_c) : {}
          };
        }
      }
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord("budget_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} budgets:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        return successful.length > 0;
      }
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      return false;
}
  }
};