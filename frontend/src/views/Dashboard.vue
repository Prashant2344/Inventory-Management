<template>
    <div class="dashboard">
        <!-- Page Header -->
        <div class="dashboard-header">
            <div class="header-info">
                <h1 class="page-main-title">Dashboard Overview</h1>
                <p class="page-description">Track your inventory, sales, and business metrics in real-time</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-secondary">
                    <component :is="Download" class="btn-icon" />
                    Export
                </button>
                <button class="btn btn-primary">
                    <component :is="Plus" class="btn-icon" />
                    Quick Sale
                </button>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="stats-grid">
            <StatsCard
                label="Total Products"
                :value="productStore.totalProducts"
                :icon="Package"
                variant="primary"
            />
            <StatsCard
                label="Low Stock Items"
                :value="productStore.lowStockProducts.length"
                :icon="AlertTriangle"
                variant="warning"
            />
            <StatsCard
                label="Today's Sales"
                :value="transactionStore.todaysSalesTotal"
                :icon="DollarSign"
                variant="success"
                prefix="$"
            />
            <StatsCard
                label="Total Clients"
                :value="clientStore.totalClients"
                :icon="Users"
                variant="primary"
            />
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
            <!-- Recent Transactions -->
            <div class="dashboard-card">
                <div class="card-header">
                    <div class="card-header-left">
                        <div class="card-header-icon transactions-icon">
                            <component :is="TrendingUp" class="header-icon" />
                        </div>
                        <div>
                            <h3 class="card-title">Recent Transactions</h3>
                            <p class="card-subtitle">Last 5 transactions</p>
                        </div>
                    </div>
                    <router-link to="/transactions" class="view-all-link">
                        View All
                        <component :is="ArrowRight" class="link-icon" />
                    </router-link>
                </div>
                <div class="card-body">
                    <div v-if="transactionStore.loading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading transactions...</p>
                    </div>
                    <div v-else-if="transactionStore.recentTransactions.length === 0" class="empty-state">
                        <div class="empty-icon-wrapper">
                            <component :is="ShoppingCart" class="empty-icon" />
                        </div>
                        <h4 class="empty-title">No transactions yet</h4>
                        <p class="empty-text">Your recent transactions will appear here</p>
                    </div>
                    <div v-else class="transactions-list">
                        <div 
                            v-for="transaction in transactionStore.recentTransactions.slice(0, 5)" 
                            :key="transaction.id"
                            class="transaction-item"
                        >
                            <div class="transaction-icon" :class="getTransactionIconClass(transaction.type)">
                                <component :is="getTransactionIcon(transaction.type)" class="item-icon" />
                            </div>
                            <div class="transaction-details">
                                <p class="transaction-type">{{ transaction.type === 'sale' ? 'Sale' : 'Purchase' }}</p>
                                <p class="transaction-date">{{ formatDate(transaction.date) }}</p>
                            </div>
                            <div class="transaction-amount" :class="getAmountClass(transaction.type)">
                                {{ transaction.type === 'sale' ? '+' : '-' }}${{ transaction.total_amount }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Low Stock Alerts -->
            <div class="dashboard-card">
                <div class="card-header">
                    <div class="card-header-left">
                        <div class="card-header-icon alerts-icon">
                            <component :is="AlertTriangle" class="header-icon" />
                        </div>
                        <div>
                            <h3 class="card-title">Low Stock Alerts</h3>
                            <p class="card-subtitle">Items needing restock</p>
                        </div>
                    </div>
                    <router-link to="/inventory" class="view-all-link">
                        View All
                        <component :is="ArrowRight" class="link-icon" />
                    </router-link>
                </div>
                <div class="card-body">
                    <div v-if="productStore.loading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                    <div v-else-if="productStore.lowStockProducts.length === 0" class="empty-state success-state">
                        <div class="empty-icon-wrapper success-wrapper">
                            <component :is="CheckCircle" class="empty-icon" />
                        </div>
                        <h4 class="empty-title">All products are well stocked!</h4>
                        <p class="empty-text">Your inventory levels are looking healthy</p>
                    </div>
                    <div v-else class="stock-alerts-list">
                        <div 
                            v-for="product in productStore.lowStockProducts.slice(0, 5)" 
                            :key="product.id"
                            class="stock-alert-item"
                        >
                            <div class="alert-icon-wrapper">
                                <component :is="AlertTriangle" class="alert-item-icon" />
                            </div>
                            <div class="alert-details">
                                <p class="product-name">{{ product.name }}</p>
                                <p class="product-sku">SKU: {{ product.sku }}</p>
                            </div>
                            <div class="stock-info">
                                <span class="stock-badge">{{ product.stock_quantity }} left</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
            <div class="section-header">
                <h3 class="section-title">Quick Actions</h3>
                <p class="section-subtitle">Frequently used actions at your fingertips</p>
            </div>
            <div class="actions-grid">
                <button class="action-card" @click="$router.push('/inventory')">
                    <div class="action-icon primary">
                        <component :is="Plus" class="action-icon-svg" />
                    </div>
                    <div class="action-content">
                        <h4 class="action-title">Add Product</h4>
                        <p class="action-desc">Add new product to inventory</p>
                    </div>
                    <component :is="ArrowRight" class="action-arrow" />
                </button>
                
                <button class="action-card" @click="$router.push('/sales')">
                    <div class="action-icon success">
                        <component :is="ShoppingCart" class="action-icon-svg" />
                    </div>
                    <div class="action-content">
                        <h4 class="action-title">New Sale</h4>
                        <p class="action-desc">Process a new transaction</p>
                    </div>
                    <component :is="ArrowRight" class="action-arrow" />
                </button>
                
                <button class="action-card" @click="$router.push('/clients')">
                    <div class="action-icon warning">
                        <component :is="UserPlus" class="action-icon-svg" />
                    </div>
                    <div class="action-content">
                        <h4 class="action-title">Add Client</h4>
                        <p class="action-desc">Register a new client</p>
                    </div>
                    <component :is="ArrowRight" class="action-arrow" />
                </button>
                
                <button class="action-card" @click="$router.push('/transactions')">
                    <div class="action-icon danger">
                        <component :is="FileText" class="action-icon-svg" />
                    </div>
                    <div class="action-content">
                        <h4 class="action-title">View Reports</h4>
                        <p class="action-desc">Check transaction history</p>
                    </div>
                    <component :is="ArrowRight" class="action-arrow" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useClientStore } from '../stores/clientStore';
import { useTransactionStore } from '../stores/transactionStore';
import StatsCard from '../components/StatsCard.vue';
import { 
    Package, AlertTriangle, DollarSign, Users, ArrowRight, 
    ShoppingCart, CheckCircle, Plus, UserPlus, FileText,
    TrendingUp, TrendingDown, Download
} from 'lucide-vue-next';

const productStore = useProductStore();
const clientStore = useClientStore();
const transactionStore = useTransactionStore();

onMounted(async () => {
    await Promise.all([
        productStore.fetchProducts(),
        productStore.fetchCategories(),
        clientStore.fetchClients(),
        transactionStore.fetchTransactions()
    ]);
});

const getTransactionIcon = (type) => {
    return type === 'sale' ? TrendingUp : TrendingDown;
};

const getTransactionIconClass = (type) => {
    return type === 'sale' ? 'transaction-sale' : 'transaction-purchase';
};

const getAmountClass = (type) => {
    return type === 'sale' ? 'amount-positive' : 'amount-negative';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Dashboard Header */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.page-main-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
}

.page-description {
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    color: #64748b;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-icon {
    width: 18px;
    height: 18px;
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
    border-color: #3b82f6;
    color: #3b82f6;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
}

/* Content Grid */
.content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 1.5rem;
}

/* Dashboard Card */
.dashboard-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: all 0.3s ease;
}

.dashboard-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.card-header-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.transactions-icon {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
    color: #3b82f6;
}

.alerts-icon {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%);
    color: #f59e0b;
}

.header-icon {
    width: 22px;
    height: 22px;
}

.card-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
}

.card-subtitle {
    margin: 0.125rem 0 0;
    font-size: 0.8125rem;
    color: #94a3b8;
}

.view-all-link {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: #3b82f6;
    font-weight: 600;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.08);
    transition: all 0.2s ease;
}

.view-all-link:hover {
    background: rgba(59, 130, 246, 0.15);
    gap: 0.625rem;
}

.link-icon {
    width: 16px;
    height: 16px;
}

.card-body {
    padding: 1.5rem;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    gap: 1rem;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.empty-icon-wrapper {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-wrapper {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
}

.empty-icon {
    width: 32px;
    height: 32px;
    color: #94a3b8;
}

.success-state .empty-icon {
    color: #10b981;
}

.empty-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
}

.empty-text {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
}

/* Transactions List */
.transactions-list,
.stock-alerts-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.transaction-item,
.stock-alert-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 14px;
    background: #f8fafc;
    transition: all 0.2s ease;
}

.transaction-item:hover,
.stock-alert-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
}

.transaction-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.transaction-sale {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%);
    color: #10b981;
}

.transaction-purchase {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%);
    color: #ef4444;
}

.item-icon {
    width: 20px;
    height: 20px;
}

.transaction-details,
.alert-details {
    flex: 1;
}

.transaction-type,
.product-name {
    margin: 0;
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9375rem;
}

.transaction-date,
.product-sku {
    margin: 0.125rem 0 0;
    font-size: 0.8125rem;
    color: #94a3b8;
}

.transaction-amount {
    font-weight: 700;
    font-size: 1.0625rem;
}

.amount-positive {
    color: #10b981;
}

.amount-negative {
    color: #ef4444;
}

/* Stock Alert Items */
.alert-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.alert-item-icon {
    width: 20px;
    height: 20px;
    color: #f59e0b;
}

.stock-info {
    display: flex;
    align-items: center;
}

.stock-badge {
    padding: 0.375rem 0.875rem;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%);
    color: #d97706;
    border-radius: 20px;
    font-size: 0.8125rem;
    font-weight: 600;
}

/* Quick Actions Section */
.quick-actions-section {
    margin-top: 0.5rem;
}

.section-header {
    margin-bottom: 1.25rem;
}

.section-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
}

.section-subtitle {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: #64748b;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.action-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
}

.action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: transparent;
}

.action-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.action-card:hover .action-icon {
    transform: scale(1.1);
}

.action-icon.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.action-icon.success {
    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.action-icon.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

.action-icon.danger {
    background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}

.action-icon-svg {
    width: 24px;
    height: 24px;
    color: white;
}

.action-content {
    flex: 1;
}

.action-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
}

.action-desc {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    color: #94a3b8;
}

.action-arrow {
    width: 20px;
    height: 20px;
    color: #cbd5e1;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.action-card:hover .action-arrow {
    color: #3b82f6;
    transform: translateX(4px);
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .content-grid {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
