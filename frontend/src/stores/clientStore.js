import { defineStore } from 'pinia';
import { clientService } from '../services/clientService';

export const useClientStore = defineStore('client', {
    state: () => ({
        clients: [],
        loading: false,
        error: null
    }),

    getters: {
        // Get client by ID
        getClientById: (state) => (id) => {
            return state.clients.find(c => c.id === id);
        },

        // Total clients count
        totalClients: (state) => state.clients.length,

        // Clients with outstanding balance
        clientsWithBalance: (state) => {
            return state.clients.filter(c => c.current_balance > 0);
        },

        // Total outstanding balance
        totalOutstanding: (state) => {
            return state.clients.reduce((sum, c) => sum + parseFloat(c.current_balance || 0), 0);
        }
    },

    actions: {
        // Fetch all clients
        async fetchClients() {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.getClients();
                this.clients = data.data || data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching clients:', error);
            } finally {
                this.loading = false;
            }
        },

        // Create client
        async createClient(clientData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.createClient(clientData);
                this.clients.push(data.data || data);
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating client:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Update client
        async updateClient(id, clientData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.updateClient(id, clientData);
                const index = this.clients.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.clients[index] = data.data || data;
                }
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating client:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete client
        async deleteClient(id) {
            this.loading = true;
            this.error = null;
            try {
                await clientService.deleteClient(id);
                this.clients = this.clients.filter(c => c.id !== id);
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting client:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
