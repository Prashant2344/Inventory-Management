import { defineStore } from 'pinia';
import { transactionService } from '../services/transactionService';

export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        transactions: [],
        cart: [],
        loading: false,
        error: null
    }),

    getters: {
        // Get transaction by ID
        getTransactionById: (state) => (id) => {
            return state.transactions.find(t => t.id === id);
        },

        // Cart total
        cartTotal: (state) => {
            return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },

        // Cart items count
        cartItemsCount: (state) => {
            return state.cart.reduce((sum, item) => sum + item.quantity, 0);
        },

        // Today's sales
        todaysSales: (state) => {
            const today = new Date().toISOString().split('T')[0];
            return state.transactions.filter(t =>
                t.type === 'sale' &&
                t.date &&
                t.date.startsWith(today)
            );
        },

        // Today's sales total
        todaysSalesTotal: (state) => {
            const today = new Date().toISOString().split('T')[0];
            return state.transactions
                .filter(t => t.type === 'sale' && t.date && t.date.startsWith(today))
                .reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);
        },

        // Recent transactions (last 10)
        recentTransactions: (state) => {
            return [...state.transactions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);
        }
    },

    actions: {
        // Fetch all transactions
        async fetchTransactions(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const data = await transactionService.getTransactions(params);
                this.transactions = data.data || data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching transactions:', error);
            } finally {
                this.loading = false;
            }
        },

        // Create transaction
        async createTransaction(transactionData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await transactionService.createTransaction(transactionData);
                this.transactions.push(data.data || data);
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating transaction:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Cart management
        addToCart(product, quantity = 1) {
            const existingItem = this.cart.find(item => item.product_id === product.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.cart.push({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    stock_quantity: product.stock_quantity
                });
            }
        },

        updateCartItemQuantity(productId, quantity) {
            const item = this.cart.find(item => item.product_id === productId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    this.removeFromCart(productId);
                }
            }
        },

        removeFromCart(productId) {
            this.cart = this.cart.filter(item => item.product_id !== productId);
        },

        clearCart() {
            this.cart = [];
        }
    }
});
