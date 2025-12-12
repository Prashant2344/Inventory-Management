<template>
    <div class="sales-view">
        <div class="sales-container">
            <!-- Left Panel - Product Selection -->
            <div class="products-panel">
                <div class="panel-header">
                    <h3 class="panel-title">Products</h3>
                    <BaseInput
                        v-model="searchQuery"
                        placeholder="Search products..."
                        :icon-left="Search"
                    />
                </div>
                
                <div class="products-grid">
                    <div v-if="productStore.loading" class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                    <div 
                        v-else
                        v-for="product in filteredProducts" 
                        :key="product.id"
                        class="product-card"
                        @click="addToCart(product)"
                    >
                        <div class="product-header">
                            <h4 class="product-name">{{ product.name }}</h4>
                            <span 
                                class="stock-indicator" 
                                :class="product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'"
                            >
                                {{ product.stock_quantity }} in stock
                            </span>
                        </div>
                        <p class="product-sku">SKU: {{ product.sku }}</p>
                        <div class="product-footer">
                            <span class="product-price">${{ product.price }}</span>
                            <component :is="Plus" class="add-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Panel - Cart & Checkout -->
            <div class="cart-panel">
                <div class="panel-header">
                    <h3 class="panel-title">Current Sale</h3>
                    <BaseButton 
                        v-if="transactionStore.cart.length > 0"
                        variant="ghost" 
                        size="sm"
                        @click="transactionStore.clearCart()"
                    >
                        Clear
                    </BaseButton>
                </div>

                <!-- Cart Items -->
                <div class="cart-items">
                    <div v-if="transactionStore.cart.length === 0" class="empty-cart">
                        <component :is="ShoppingCart" class="empty-icon" />
                        <p>No items in cart</p>
                        <p class="empty-hint">Click on products to add them</p>
                    </div>
                    <div 
                        v-else
                        v-for="item in transactionStore.cart" 
                        :key="item.product_id"
                        class="cart-item"
                    >
                        <div class="item-info">
                            <p class="item-name">{{ item.name }}</p>
                            <p class="item-price">${{ item.price }} each</p>
                        </div>
                        <div class="item-controls">
                            <button 
                                class="qty-btn"
                                @click="updateQuantity(item.product_id, item.quantity - 1)"
                            >
                                <component :is="Minus" class="w-4 h-4" />
                            </button>
                            <span class="qty-display">{{ item.quantity }}</span>
                            <button 
                                class="qty-btn"
                                @click="updateQuantity(item.product_id, item.quantity + 1)"
                                :disabled="item.quantity >= item.stock_quantity"
                            >
                                <component :is="Plus" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="item-total">
                            ${{ (item.price * item.quantity).toFixed(2) }}
                        </div>
                        <button 
                            class="remove-btn"
                            @click="transactionStore.removeFromCart(item.product_id)"
                        >
                            <component :is="X" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Client Selection -->
                <div v-if="transactionStore.cart.length > 0" class="client-section">
                    <BaseInput
                        v-model="selectedClientId"
                        type="select"
                        label="Client (Optional)"
                        :options="clientOptions"
                        placeholder="Cash Sale"
                    />
                </div>

                <!-- Payment Method -->
                <div v-if="transactionStore.cart.length > 0" class="payment-section">
                    <label class="section-label">Payment Method</label>
                    <div class="payment-options">
                        <button 
                            v-for="method in paymentMethods" 
                            :key="method.value"
                            class="payment-btn"
                            :class="{ active: paymentMethod === method.value }"
                            @click="paymentMethod = method.value"
                        >
                            <component :is="method.icon" class="w-5 h-5" />
                            {{ method.label }}
                        </button>
                    </div>
                </div>

                <!-- Totals -->
                <div v-if="transactionStore.cart.length > 0" class="totals-section">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>${{ transactionStore.cartTotal.toFixed(2) }}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total</span>
                        <span>${{ transactionStore.cartTotal.toFixed(2) }}</span>
                    </div>
                </div>

                <!-- Checkout Button -->
                <BaseButton 
                    v-if="transactionStore.cart.length > 0"
                    class="checkout-btn"
                    size="lg"
                    :loading="processing"
                    @click="processTransaction"
                >
                    Complete Sale
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useClientStore } from '../stores/clientStore';
import { useTransactionStore } from '../stores/transactionStore';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import { 
    Search, Plus, Minus, X, ShoppingCart, 
    CreditCard, Banknote, Wallet 
} from 'lucide-vue-next';

const productStore = useProductStore();
const clientStore = useClientStore();
const transactionStore = useTransactionStore();

const searchQuery = ref('');
const selectedClientId = ref('');
const paymentMethod = ref('cash');
const processing = ref(false);

const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'credit', label: 'Credit', icon: Wallet }
];

const filteredProducts = computed(() => {
    if (!searchQuery.value) return productStore.products;
    
    const query = searchQuery.value.toLowerCase();
    return productStore.products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
});

const clientOptions = computed(() => {
    return [
        { value: '', label: 'Cash Sale (No Client)' },
        ...clientStore.clients.map(client => ({
            value: client.id,
            label: client.name
        }))
    ];
});

onMounted(async () => {
    await Promise.all([
        productStore.fetchProducts(),
        clientStore.fetchClients()
    ]);
});

const addToCart = (product) => {
    if (product.stock_quantity > 0) {
        transactionStore.addToCart(product, 1);
    } else {
        alert('This product is out of stock');
    }
};

const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
        transactionStore.removeFromCart(productId);
    } else {
        transactionStore.updateCartItemQuantity(productId, newQuantity);
    }
};

const processTransaction = async () => {
    processing.value = true;
    try {
        const transactionData = {
            type: 'sale',
            client_id: selectedClientId.value || null,
            total_amount: transactionStore.cartTotal,
            status: 'completed',
            payment_status: paymentMethod.value === 'credit' ? 'credit' : 'paid',
            date: new Date().toISOString(),
            items: transactionStore.cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            payments: paymentMethod.value !== 'credit' ? [{
                amount: transactionStore.cartTotal,
                method: paymentMethod.value,
                date: new Date().toISOString()
            }] : []
        };

        await transactionStore.createTransaction(transactionData);
        
        // Refresh data
        await Promise.all([
            productStore.fetchProducts(),
            clientStore.fetchClients()
        ]);
        
        // Reset form
        transactionStore.clearCart();
        selectedClientId.value = '';
        paymentMethod.value = 'cash';
        
        alert('Sale completed successfully!');
    } catch (error) {
        console.error('Error processing transaction:', error);
        alert('Failed to process sale. Please try again.');
    } finally {
        processing.value = false;
    }
};
</script>

<style scoped>
.sales-view {
    height: calc(100vh - 180px);
}

.sales-container {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 1.5rem;
    height: 100%;
}

.products-panel,
.cart-panel {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.panel-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-gray-900);
    margin: 0;
}

.products-grid {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    align-content: start;
}

.product-card {
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
    padding: 1rem;
    cursor: pointer;
    transition: all var(--transition-base);
    border: 2px solid transparent;
}

.product-card:hover {
    background: white;
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.product-name {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-gray-900);
    margin: 0;
    flex: 1;
}

.stock-indicator {
    font-size: var(--font-size-xs);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
    font-weight: 600;
}

.in-stock {
    background: #D1FAE5;
    color: #065F46;
}

.out-of-stock {
    background: #FEE2E2;
    color: #991B1B;
}

.product-sku {
    font-size: var(--font-size-sm);
    color: var(--color-gray-500);
    margin: 0 0 0.75rem 0;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-primary);
}

.add-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
}

.cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.5rem;
    color: var(--color-gray-500);
}

.empty-icon {
    width: 4rem;
    height: 4rem;
    color: var(--color-gray-300);
}

.empty-hint {
    font-size: var(--font-size-sm);
}

.cart-item {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
}

.item-info {
    flex: 1;
}

.item-name {
    font-weight: 600;
    color: var(--color-gray-900);
    margin: 0;
    font-size: var(--font-size-sm);
}

.item-price {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
    margin: 0;
}

.item-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.qty-btn {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-gray-300);
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-base);
}

.qty-btn:hover:not(:disabled) {
    background: var(--color-gray-100);
    border-color: var(--color-gray-400);
}

.qty-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.qty-display {
    min-width: 2rem;
    text-align: center;
    font-weight: 600;
}

.item-total {
    font-weight: 700;
    color: var(--color-gray-900);
}

.remove-btn {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-md);
    border: none;
    background: transparent;
    color: var(--color-danger);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-base);
}

.remove-btn:hover {
    background: var(--color-red-50);
}

.client-section,
.payment-section {
    padding: 0 1.5rem 1rem 1.5rem;
    border-top: 1px solid var(--color-gray-200);
    padding-top: 1rem;
}

.section-label {
    display: block;
    margin-bottom: 0.75rem;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-gray-700);
}

.payment-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
}

.payment-btn {
    padding: 0.75rem;
    border: 2px solid var(--color-gray-300);
    border-radius: var(--radius-lg);
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-gray-700);
    transition: all var(--transition-base);
}

.payment-btn:hover {
    border-color: var(--color-primary);
}

.payment-btn.active {
    border-color: var(--color-primary);
    background: var(--color-blue-50);
    color: var(--color-primary);
}

.totals-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-gray-200);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.total-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-base);
    color: var(--color-gray-700);
}

.total-final {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-gray-900);
    padding-top: 0.5rem;
    border-top: 2px solid var(--color-gray-300);
}

.checkout-btn {
    margin: 0 1.5rem 1.5rem 1.5rem;
    width: calc(100% - 3rem);
}

.loading-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    color: var(--color-gray-500);
}
</style>
