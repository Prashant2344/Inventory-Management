<template>
    <div class="clients-view">
        <!-- Header -->
        <div class="view-header">
            <div>
                <h2 class="view-title">Client Management</h2>
                <p class="view-subtitle">Manage clients and track credit</p>
            </div>
            <BaseButton 
                :icon="UserPlus" 
                @click="openClientModal()"
            >
                Add Client
            </BaseButton>
        </div>

        <!-- Stats -->
        <div class="stats-row">
            <div class="stat-card">
                <component :is="Users" class="stat-icon text-blue-600" />
                <div>
                    <p class="stat-label">Total Clients</p>
                    <p class="stat-value">{{ clientStore.totalClients }}</p>
                </div>
            </div>
            <div class="stat-card">
                <component :is="DollarSign" class="stat-icon text-amber-600" />
                <div>
                    <p class="stat-label">Outstanding Balance</p>
                    <p class="stat-value">${{ clientStore.totalOutstanding.toFixed(2) }}</p>
                </div>
            </div>
            <div class="stat-card">
                <component :is="AlertCircle" class="stat-icon text-red-600" />
                <div>
                    <p class="stat-label">Clients with Balance</p>
                    <p class="stat-value">{{ clientStore.clientsWithBalance.length }}</p>
                </div>
            </div>
        </div>

        <!-- Clients Table -->
        <DataTable
            :columns="columns"
            :data="clientStore.clients"
            :loading="clientStore.loading"
        >
            <template #actions>
                <BaseButton 
                    variant="outline" 
                    size="sm"
                    @click="clientStore.fetchClients()"
                >
                    Refresh
                </BaseButton>
            </template>

            <template #cell-name="{ row }">
                <div class="client-cell">
                    <div class="client-avatar">
                        {{ getInitials(row.name) }}
                    </div>
                    <div class="client-info">
                        <p class="client-name">{{ row.name }}</p>
                        <p class="client-email">{{ row.email }}</p>
                    </div>
                </div>
            </template>

            <template #cell-phone="{ row }">
                <span class="phone-text">{{ row.phone || 'N/A' }}</span>
            </template>

            <template #cell-current_balance="{ row }">
                <span 
                    class="balance-badge" 
                    :class="row.current_balance > 0 ? 'balance-owed' : 'balance-clear'"
                >
                    ${{ parseFloat(row.current_balance || 0).toFixed(2) }}
                </span>
            </template>

            <template #cell-credit_limit="{ row }">
                <span class="credit-text">${{ parseFloat(row.credit_limit || 0).toFixed(2) }}</span>
            </template>

            <template #row-actions="{ row }">
                <div class="action-buttons">
                    <button 
                        class="action-btn action-btn-edit"
                        @click="openClientModal(row)"
                        title="Edit"
                    >
                        <component :is="Edit" class="w-4 h-4" />
                    </button>
                    <button 
                        class="action-btn action-btn-delete"
                        @click="confirmDelete(row)"
                        title="Delete"
                    >
                        <component :is="Trash2" class="w-4 h-4" />
                    </button>
                </div>
            </template>
        </DataTable>

        <!-- Client Modal -->
        <BaseModal 
            v-model="showClientModal" 
            :title="editingClient ? 'Edit Client' : 'Add Client'"
        >
            <form @submit.prevent="saveClient">
                <BaseInput
                    v-model="clientForm.name"
                    label="Client Name"
                    placeholder="Enter client name"
                    required
                />
                
                <BaseInput
                    v-model="clientForm.email"
                    type="email"
                    label="Email"
                    placeholder="client@example.com"
                />
                
                <BaseInput
                    v-model="clientForm.phone"
                    label="Phone"
                    placeholder="+1 (555) 000-0000"
                />
                
                <BaseInput
                    v-model="clientForm.address"
                    type="textarea"
                    label="Address"
                    placeholder="Enter address"
                    :rows="3"
                />
                
                <div class="form-row">
                    <BaseInput
                        v-model="clientForm.credit_limit"
                        type="number"
                        label="Credit Limit"
                        placeholder="0.00"
                        step="0.01"
                    />
                    
                    <BaseInput
                        v-model="clientForm.current_balance"
                        type="number"
                        label="Current Balance"
                        placeholder="0.00"
                        step="0.01"
                        :disabled="!!editingClient"
                        hint="Balance is updated automatically with transactions"
                    />
                </div>
            </form>

            <template #footer>
                <BaseButton variant="ghost" @click="showClientModal = false">
                    Cancel
                </BaseButton>
                <BaseButton 
                    @click="saveClient" 
                    :loading="saving"
                >
                    {{ editingClient ? 'Update' : 'Create' }}
                </BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useClientStore } from '../stores/clientStore';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseModal from '../components/BaseModal.vue';
import DataTable from '../components/DataTable.vue';
import { UserPlus, Edit, Trash2, Users, DollarSign, AlertCircle } from 'lucide-vue-next';

const clientStore = useClientStore();

const showClientModal = ref(false);
const editingClient = ref(null);
const saving = ref(false);

const clientForm = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    credit_limit: 0,
    current_balance: 0
});

const columns = [
    { key: 'name', label: 'Client', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'current_balance', label: 'Balance', sortable: true },
    { key: 'credit_limit', label: 'Credit Limit', sortable: true },
];

onMounted(async () => {
    await clientStore.fetchClients();
});

const getInitials = (name) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const openClientModal = (client = null) => {
    editingClient.value = client;
    if (client) {
        clientForm.value = { ...client };
    } else {
        clientForm.value = {
            name: '',
            email: '',
            phone: '',
            address: '',
            credit_limit: 0,
            current_balance: 0
        };
    }
    showClientModal.value = true;
};

const saveClient = async () => {
    saving.value = true;
    try {
        if (editingClient.value) {
            await clientStore.updateClient(editingClient.value.id, clientForm.value);
        } else {
            await clientStore.createClient(clientForm.value);
        }
        showClientModal.value = false;
    } catch (error) {
        console.error('Error saving client:', error);
        alert('Failed to save client');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (client) => {
    if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
        try {
            await clientStore.deleteClient(client.id);
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client');
        }
    }
};
</script>

<style scoped>
.clients-view {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.view-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    color: var(--color-gray-900);
    margin: 0;
}

.view-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-gray-600);
    margin: 0.25rem 0 0 0;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all var(--transition-base);
}

.stat-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
}

.stat-icon {
    width: 3rem;
    height: 3rem;
    padding: 0.75rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
}

.stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin: 0;
}

.stat-value {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-gray-900);
    margin: 0;
}

.client-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.client-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-full);
    background: var(--gradient-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--font-size-sm);
    flex-shrink: 0;
}

.client-info {
    flex: 1;
}

.client-name {
    font-weight: 600;
    color: var(--color-gray-900);
    margin: 0;
}

.client-email {
    font-size: var(--font-size-sm);
    color: var(--color-gray-500);
    margin: 0;
}

.phone-text {
    color: var(--color-gray-700);
}

.balance-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.balance-owed {
    background: #FEE2E2;
    color: #991B1B;
}

.balance-clear {
    background: #D1FAE5;
    color: #065F46;
}

.credit-text {
    font-weight: 600;
    color: var(--color-gray-700);
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.action-btn {
    padding: 0.5rem;
    border-radius: var(--radius-md);
    border: none;
    background: transparent;
    transition: all var(--transition-base);
    cursor: pointer;
}

.action-btn-edit {
    color: var(--color-primary);
}

.action-btn-edit:hover {
    background: var(--color-blue-50);
}

.action-btn-delete {
    color: var(--color-danger);
}

.action-btn-delete:hover {
    background: var(--color-red-50);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}
</style>
