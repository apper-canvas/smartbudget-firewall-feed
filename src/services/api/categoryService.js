import categoriesData from "@/services/mockData/categories.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let categories = [...categoriesData];

export const categoryService = {
  async getAll() {
    await delay(250);
    return [...categories];
  },

  async getById(id) {
    await delay(200);
    const category = categories.find(c => c.id === parseInt(id));
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  },

  async create(categoryData) {
    await delay(300);
    const maxId = Math.max(...categories.map(c => c.id), 0);
    const newCategory = {
      ...categoryData,
      id: maxId + 1
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, categoryData) {
    await delay(300);
    const index = categories.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    categories[index] = {
      ...categories[index],
      ...categoryData,
      id: parseInt(id)
    };
    return { ...categories[index] };
  },

  async delete(id) {
    await delay(250);
    const index = categories.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    categories.splice(index, 1);
    return { success: true };
  }
};