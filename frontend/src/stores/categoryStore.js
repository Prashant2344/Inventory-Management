import { defineStore } from 'pinia';
import { categoryService } from '../services/categoryService';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        loading: false,
        error: null,
    }),

    getters: {
        totalCategories: (state) => state.categories.length,
    },

    actions: {
        async fetchCategories() {
            this.loading = true;
            this.error = null;
            try {
                const data = await categoryService.getCategories();
                this.categories = data.data || data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching categories:', error);
            } finally {
                this.loading = false;
            }
        },

        async createCategory(categoryData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await categoryService.createCategory(categoryData);
                this.categories.push(data.data || data);
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating category:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCategory(id, categoryData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await categoryService.updateCategory(id, categoryData);
                const index = this.categories.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.categories[index] = data.data || data;
                }
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating category:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteCategory(id) {
            this.loading = true;
            this.error = null;
            try {
                await categoryService.deleteCategory(id);
                this.categories = this.categories.filter(c => c.id !== id);
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting category:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
