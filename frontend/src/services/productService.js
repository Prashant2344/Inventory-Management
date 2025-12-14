import api from './api';

export const productService = {
    // Get all products
    async getProducts() {
        const response = await api.get('/products');
        return response.data;
    },

    // Get single product
    async getProduct(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Create product
    async createProduct(productData) {
        const response = await api.post('/products', productData);
        return response.data;
    },

    // Update product
    async updateProduct(id, productData) {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete product
    async deleteProduct(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    // Adjust stock
    async adjustStock(id, stockData) {
        const response = await api.post(`/products/${id}/stock`, stockData);
        return response.data;
    },

    // Get all categories
    async getCategories() {
        const response = await api.get('/categories');
        return response.data;
    },

    // Create category
    async createCategory(categoryData) {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    // Update category
    async updateCategory(id, categoryData) {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    // Delete category
    async deleteCategory(id) {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};
