import { defineStore } from 'pinia';
import { productService } from '../services/productService';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        categories: [],
        loading: false,
        error: null
    }),

    getters: {
        // Get products by category
        productsByCategory: (state) => (categoryId) => {
            return state.products.filter(p => p.category_id === categoryId);
        },

        // Get low stock products
        lowStockProducts: (state) => {
            return state.products.filter(p => p.stock_quantity <= p.min_stock_level);
        },

        // Get product by ID
        getProductById: (state) => (id) => {
            return state.products.find(p => p.id === id);
        },

        // Total products count
        totalProducts: (state) => state.products.length,

        // Total stock value
        totalStockValue: (state) => {
            return state.products.reduce((sum, p) => sum + (p.stock_quantity * p.cost), 0);
        }
    },

    actions: {
        // Fetch all products
        async fetchProducts() {
            this.loading = true;
            this.error = null;
            try {
                const data = await productService.getProducts();
                this.products = data.data || data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching products:', error);
            } finally {
                this.loading = false;
            }
        },

        // Fetch all categories
        async fetchCategories() {
            this.loading = true;
            this.error = null;
            try {
                const data = await productService.getCategories();
                this.categories = data.data || data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching categories:', error);
            } finally {
                this.loading = false;
            }
        },

        // Create product
        async createProduct(productData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await productService.createProduct(productData);
                this.products.push(data.data || data);
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating product:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Update product
        async updateProduct(id, productData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await productService.updateProduct(id, productData);
                const index = this.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.products[index] = data.data || data;
                }
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating product:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete product
        async deleteProduct(id) {
            this.loading = true;
            this.error = null;
            try {
                await productService.deleteProduct(id);
                this.products = this.products.filter(p => p.id !== id);
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting product:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Adjust stock
        async adjustStock(id, stockData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await productService.adjustStock(id, stockData);
                const index = this.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.products[index] = data.data || data;
                }
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error adjusting stock:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Create category
        async createCategory(categoryData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await productService.createCategory(categoryData);
                this.categories.push(data.data || data);
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating category:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
