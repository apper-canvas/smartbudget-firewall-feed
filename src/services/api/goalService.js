import goalsData from "@/services/mockData/goals.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let goals = [...goalsData];

export const goalService = {
  async getAll() {
    await delay(300);
    return [...goals];
  },

  async getById(id) {
    await delay(200);
    const goal = goals.find(g => g.id === parseInt(id));
    if (!goal) {
      throw new Error("Goal not found");
    }
    return { ...goal };
  },

  async create(goalData) {
    await delay(400);
    const maxId = Math.max(...goals.map(g => g.id), 0);
    const newGoal = {
      ...goalData,
      id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    goals.push(newGoal);
    return { ...newGoal };
  },

  async update(id, goalData) {
    await delay(350);
    const index = goals.findIndex(g => g.id === parseInt(id));
    if (index === -1) {
      throw new Error("Goal not found");
    }
    
    goals[index] = {
      ...goals[index],
      ...goalData,
      id: parseInt(id)
    };
    return { ...goals[index] };
  },

  async delete(id) {
    await delay(250);
    const index = goals.findIndex(g => g.id === parseInt(id));
    if (index === -1) {
      throw new Error("Goal not found");
    }
    
    goals.splice(index, 1);
    return { success: true };
  }
};