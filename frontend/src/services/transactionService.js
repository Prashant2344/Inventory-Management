import api from './api';

export const transactionService = {
    // Get all transactions
    async getTransactions(params = {}) {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    // Get single transaction
    async getTransaction(id) {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    // Create transaction (sale/purchase)
    async createTransaction(transactionData) {
        const response = await api.post('/transactions', transactionData);
        return response.data;
    },

    // Update transaction
    async updateTransaction(id, transactionData) {
        const response = await api.put(`/transactions/${id}`, transactionData);
        return response.data;
    },

    // Delete transaction
    async deleteTransaction(id) {
        const response = await api.delete(`/transactions/${id}`);
        return response.data;
    }
};
