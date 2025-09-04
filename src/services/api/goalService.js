import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

export const goalService = {
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords("goal_c", params);
      
      if (!response?.data?.length) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(goal => ({
        id: goal.Id,
        name: goal.name_c || goal.Name,
        targetAmount: goal.target_amount_c,
        currentAmount: goal.current_amount_c,
        deadline: goal.deadline_c,
        createdAt: goal.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching goals:", error?.response?.data?.message || error);
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ]
      };

      const response = await apperClient.getRecordById("goal_c", parseInt(id), params);
      
      if (!response?.data) {
        throw new Error("Goal not found");
      }

      // Transform database fields to match UI expectations
      return {
        id: response.data.Id,
        name: response.data.name_c || response.data.Name,
        targetAmount: response.data.target_amount_c,
        currentAmount: response.data.current_amount_c,
        deadline: response.data.deadline_c,
        createdAt: response.data.created_at_c
      };
    } catch (error) {
      console.error(`Error fetching goal ${id}:`, error?.response?.data?.message || error);
      throw new Error("Goal not found");
    }
  },

  async create(goalData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: goalData.name,
          name_c: goalData.name,
          target_amount_c: goalData.targetAmount,
          current_amount_c: goalData.currentAmount,
          deadline_c: goalData.deadline,
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await apperClient.createRecord("goal_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} goals:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create goal");
        }

        if (successful.length > 0) {
          const createdGoal = successful[0].data;
          return {
            id: createdGoal.Id,
            name: createdGoal.name_c || createdGoal.Name,
            targetAmount: createdGoal.target_amount_c,
            currentAmount: createdGoal.current_amount_c,
            deadline: createdGoal.deadline_c,
            createdAt: createdGoal.created_at_c
          };
        }
      }
    } catch (error) {
      console.error("Error creating goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, goalData) {
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
          Name: goalData.name,
          name_c: goalData.name,
          target_amount_c: goalData.targetAmount,
          current_amount_c: goalData.currentAmount,
          deadline_c: goalData.deadline
        }]
      };

      const response = await apperClient.updateRecord("goal_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} goals:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update goal");
        }

        if (successful.length > 0) {
          const updatedGoal = successful[0].data;
          return {
            id: updatedGoal.Id,
            name: updatedGoal.name_c || updatedGoal.Name,
            targetAmount: updatedGoal.target_amount_c,
            currentAmount: updatedGoal.current_amount_c,
            deadline: updatedGoal.deadline_c,
            createdAt: updatedGoal.created_at_c
          };
        }
      }
    } catch (error) {
      console.error("Error updating goal:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord("goal_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} goals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        return successful.length > 0;
      }
    } catch (error) {
      console.error("Error deleting goal:", error?.response?.data?.message || error);
      return false;
    }
}
};