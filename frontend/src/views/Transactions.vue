<template>
    <div class="transactions-view">
        <!-- Header -->
        <div class="view-header">
            <div>
                <h2 class="view-title">Transaction History</h2>
                <p class="view-subtitle">View all sales and purchases</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
            <BaseInput
                v-model="filters.type"
                type="select"
                label="Type"
                :options="typeOptions"
            />
            <BaseInput
                v-model="filters.status"
                type="select"
                label="Status"
                :options="statusOptions"
            />
            <BaseInput
                v-model="filters.paymentStatus"
                type="select"
                label="Payment Status"
                :options="paymentStatusOptions"
            />
        </div>

        <!-- Transactions Table -->
        <DataTable
            :columns="columns"
            :data="filteredTransactions"
            :loading="transactionStore.loading"
        >
            <template #actions>
                <BaseButton 
                    variant="outline" 
                    size="sm"
                    @click="transactionStore.fetchTransactions()"
                >
                    Refresh
                </BaseButton>
            </template>

            <template #cell-type="{ row }">
                <span 
                    class="type-badge" 
                    :class="row.type === 'sale' ? 'type-sale' : 'type-purchase'"
                >
                    {{ row.type === 'sale' ? 'Sale' : 'Purchase' }}
                </span>
            </template>

            <template #cell-date="{ row }">
                <span class="date-text">{{ formatDate(row.date) }}</span>
            </template>

            <template #cell-total_amount="{ row }">
                <span class="amount-text">${{ parseFloat(row.total_amount || 0).toFixed(2) }}</span>
            </template>

            <template #cell-status="{ row }">
                <span 
                    class="status-badge" 
                    :class="getStatusClass(row.status)"
                >
                    {{ row.status }}
                </span>
            </template>

            <template #cell-payment_status="{ row }">
                <span 
                    class="payment-badge" 
                    :class="getPaymentStatusClass(row.payment_status)"
                >
                    {{ row.payment_status }}
                </span>
            </template>

            <template #row-actions="{ row }">
                <div class="action-buttons">
                    <button 
                        class="action-btn action-btn-view"
                        @click="viewTransaction(row)"
                        title="View Details"
                    >
                        <component :is="Eye" class="w-4 h-4" />
                    </button>
                </div>
            </template>
        </DataTable>

        <!-- Transaction Detail Modal -->
        <BaseModal 
            v-model="showDetailModal" 
            title="Transaction Details"
        >
            <div v-if="selectedTransaction" class="transaction-detail">
                <!-- Header Info -->
                <div class="detail-header">
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID</span>
                        <span class="detail-value">#{{ selectedTransaction.id }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">{{ formatDate(selectedTransaction.date) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type</span>
                        <span 
                            class="type-badge" 
                            :class="selectedTransaction.type === 'sale' ? 'type-sale' : 'type-purchase'"
                        >
                            {{ selectedTransaction.type === 'sale' ? 'Sale' : 'Purchase' }}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span 
                            class="status-badge" 
                            :class="getStatusClass(selectedTransaction.status)"
                        >
                            {{ selectedTransaction.status }}
                        </span>
                    </div>
                </div>

                <!-- Items -->
                <div class="detail-section">
                    <h4 class="section-title">Items</h4>
                    <div class="items-list">
                        <div 
                            v-for="(item, index) in selectedTransaction.items" 
                            :key="index"
                            class="item-row"
                        >
                            <span class="item-name">{{ item.product?.name || 'Product' }}</span>
                            <span class="item-qty">x{{ item.quantity }}</span>
                            <span class="item-price">${{ item.price }}</span>
                            <span class="item-total">${{ item.total }}</span>
                        </div>
                    </div>
                </div>

                <!-- Total -->
                <div class="detail-total">
                    <span>Total Amount</span>
                    <span class="total-amount">${{ parseFloat(selectedTransaction.total_amount || 0).toFixed(2) }}</span>
                </div>

                <!-- Payment Info -->
                <div v-if="selectedTransaction.payments && selectedTransaction.payments.length > 0" class="detail-section">
                    <h4 class="section-title">Payments</h4>
                    <div class="payments-list">
                        <div 
                            v-for="(payment, index) in selectedTransaction.payments" 
                            :key="index"
                            class="payment-row"
                        >
                            <span class="payment-method">{{ payment.method }}</span>
                            <span class="payment-date">{{ formatDate(payment.date) }}</span>
                            <span class="payment-amount">${{ payment.amount }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <BaseButton variant="ghost" @click="showDetailModal = false">
                    Close
                </BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseModal from '../components/BaseModal.vue';
import DataTable from '../components/DataTable.vue';
import { Eye } from 'lucide-vue-next';

const transactionStore = useTransactionStore();

const showDetailModal = ref(false);
const selectedTransaction = ref(null);

const filters = ref({
    type: '',
    status: '',
    paymentStatus: ''
});

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'total_amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'payment_status', label: 'Payment', sortable: true },
];

const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'sale', label: 'Sales' },
    { value: 'purchase', label: 'Purchases' }
];

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
];

const paymentStatusOptions = [
    { value: '', label: 'All Payment Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'credit', label: 'Credit' }
];

const filteredTransactions = computed(() => {
    let transactions = [...transactionStore.transactions];
    
    if (filters.value.type) {
        transactions = transactions.filter(t => t.type === filters.value.type);
    }
    
    if (filters.value.status) {
        transactions = transactions.filter(t => t.status === filters.value.status);
    }
    
    if (filters.value.paymentStatus) {
        transactions = transactions.filter(t => t.payment_status === filters.value.paymentStatus);
    }
    
    return transactions;
});

onMounted(async () => {
    await transactionStore.fetchTransactions();
});

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusClass = (status) => {
    const classes = {
        pending: 'status-pending',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
    };
    return classes[status] || '';
};

const getPaymentStatusClass = (paymentStatus) => {
    const classes = {
        paid: 'payment-paid',
        partial: 'payment-partial',
        credit: 'payment-credit'
    };
    return classes[paymentStatus] || '';
};

const viewTransaction = (transaction) => {
    selectedTransaction.value = transaction;
    showDetailModal.value = true;
};
</script>

<style scoped>
.transactions-view {
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

.filters-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.type-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.type-sale {
    background: #D1FAE5;
    color: #065F46;
}

.type-purchase {
    background: #DBEAFE;
    color: #1E40AF;
}

.date-text {
    color: var(--color-gray-700);
}

.amount-text {
    font-weight: 600;
    color: var(--color-gray-900);
}

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.status-pending {
    background: #FEF3C7;
    color: #92400E;
}

.status-completed {
    background: #D1FAE5;
    color: #065F46;
}

.status-cancelled {
    background: #FEE2E2;
    color: #991B1B;
}

.payment-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.payment-paid {
    background: #D1FAE5;
    color: #065F46;
}

.payment-partial {
    background: #FEF3C7;
    color: #92400E;
}

.payment-credit {
    background: #E0E7FF;
    color: #3730A3;
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

.action-btn-view {
    color: var(--color-primary);
}

.action-btn-view:hover {
    background: var(--color-blue-50);
}

.transaction-detail {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.detail-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
}

.detail-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    font-weight: 500;
}

.detail-value {
    font-size: var(--font-size-base);
    color: var(--color-gray-900);
    font-weight: 600;
}

.detail-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.section-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-gray-900);
    margin: 0;
}

.items-list,
.payments-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.item-row,
.payment-row {
    display: grid;
    grid-template-columns: 2fr auto auto auto;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
    align-items: center;
}

.item-name,
.payment-method {
    font-weight: 600;
    color: var(--color-gray-900);
}

.item-qty,
.item-price,
.payment-date {
    color: var(--color-gray-600);
    font-size: var(--font-size-sm);
}

.item-total,
.payment-amount {
    font-weight: 700;
    color: var(--color-gray-900);
    text-align: right;
}

.detail-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--gradient-primary);
    color: white;
    border-radius: var(--radius-lg);
    font-size: var(--font-size-lg);
    font-weight: 600;
}

.total-amount {
    font-size: var(--font-size-2xl);
    font-weight: 700;
}
</style>
