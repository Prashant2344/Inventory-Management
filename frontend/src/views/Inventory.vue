<template>
    <div class="inventory-view">
        <!-- Header -->
        <div class="view-header">
            <div>
                <h2 class="view-title">Inventory Management</h2>
                <p class="view-subtitle">Manage your products and stock levels</p>
            </div>
            <BaseButton 
                :icon="Plus" 
                @click="openProductModal()"
            >
                Add Product
            </BaseButton>
        </div>

        <!-- Products Table -->
        <DataTable
            :columns="columns"
            :data="productStore.products"
            :loading="productStore.loading"
        >
            <template #actions>
                <BaseButton 
                    variant="outline" 
                    size="sm"
                    @click="productStore.fetchProducts()"
                >
                    Refresh
                </BaseButton>
            </template>

            <template #cell-name="{ row }">
                <div class="product-cell">
                    <div class="product-info">
                        <p class="product-name">{{ row.name }}</p>
                        <p class="product-sku">SKU: {{ row.sku }}</p>
                    </div>
                </div>
            </template>

            <template #cell-category_id="{ row }">
                <span class="category-badge">
                    {{ getCategoryName(row.category_id) }}
                </span>
            </template>

            <template #cell-stock_quantity="{ row }">
                <span 
                    class="stock-badge" 
                    :class="getStockBadgeClass(row.stock_quantity, row.min_stock_level)"
                >
                    {{ row.stock_quantity }}
                </span>
            </template>

            <template #cell-price="{ row }">
                <span class="price-text">${{ row.price }}</span>
            </template>

            <template #row-actions="{ row }">
                <div class="action-buttons">
                    <button 
                        class="action-btn action-btn-edit"
                        @click="openProductModal(row)"
                        title="Edit"
                    >
                        <component :is="Edit" class="w-4 h-4" />
                    </button>
                    <button 
                        class="action-btn action-btn-stock"
                        @click="openStockModal(row)"
                        title="Adjust Stock"
                    >
                        <component :is="Package" class="w-4 h-4" />
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

        <!-- Product Modal -->
        <BaseModal 
            v-model="showProductModal" 
            :title="editingProduct ? 'Edit Product' : 'Add Product'"
        >
            <form @submit.prevent="saveProduct">
                <BaseInput
                    v-model="productForm.name"
                    label="Product Name"
                    placeholder="Enter product name"
                    required
                />
                
                <BaseInput
                    v-model="productForm.sku"
                    label="SKU"
                    placeholder="Enter SKU"
                    required
                />
                
                <BaseInput
                    v-model="productForm.category_id"
                    type="select"
                    label="Category"
                    :options="categoryOptions"
                    required
                />
                
                <div class="form-row">
                    <BaseInput
                        v-model="productForm.price"
                        type="number"
                        label="Price"
                        placeholder="0.00"
                        required
                        step="0.01"
                    />
                    
                    <BaseInput
                        v-model="productForm.cost"
                        type="number"
                        label="Cost"
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
                
                <div class="form-row">
                    <BaseInput
                        v-model="productForm.stock_quantity"
                        type="number"
                        label="Stock Quantity"
                        placeholder="0"
                    />
                    
                    <BaseInput
                        v-model="productForm.min_stock_level"
                        type="number"
                        label="Min Stock Level"
                        placeholder="5"
                    />
                </div>
                
                <BaseInput
                    v-model="productForm.description"
                    type="textarea"
                    label="Description"
                    placeholder="Enter product description"
                    :rows="3"
                />
            </form>

            <template #footer>
                <BaseButton variant="ghost" @click="showProductModal = false">
                    Cancel
                </BaseButton>
                <BaseButton 
                    variant="success"
                    @click="saveProduct" 
                    :loading="saving"
                >
                    {{ editingProduct ? 'Update Product' : 'Create Product' }}
                </BaseButton>
            </template>
        </BaseModal>

        <!-- Stock Adjustment Modal -->
        <BaseModal 
            v-model="showStockModal" 
            title="Adjust Stock"
        >
            <div v-if="selectedProduct" class="stock-modal-content">
                <div class="current-stock">
                    <p class="label">Current Stock</p>
                    <p class="value">{{ selectedProduct.stock_quantity }}</p>
                </div>
                
                <BaseInput
                    v-model="stockForm.quantity"
                    type="number"
                    label="Adjustment Quantity"
                    placeholder="Enter quantity (positive to add, negative to subtract)"
                    required
                />
                
                <BaseInput
                    v-model="stockForm.type"
                    type="select"
                    label="Type"
                    :options="stockTypeOptions"
                    required
                />
                
                <BaseInput
                    v-model="stockForm.notes"
                    type="textarea"
                    label="Notes"
                    placeholder="Reason for adjustment"
                    :rows="3"
                />
            </div>

            <template #footer>
                <BaseButton variant="ghost" @click="showStockModal = false">
                    Cancel
                </BaseButton>
                <BaseButton 
                    variant="warning"
                    @click="adjustStock" 
                    :loading="saving"
                >
                    Adjust Stock
                </BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseModal from '../components/BaseModal.vue';
import DataTable from '../components/DataTable.vue';
import { Plus, Edit, Trash2, Package } from 'lucide-vue-next';

const productStore = useProductStore();

const showProductModal = ref(false);
const showStockModal = ref(false);
const editingProduct = ref(null);
const selectedProduct = ref(null);
const saving = ref(false);

const productForm = ref({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    cost: '',
    stock_quantity: 0,
    min_stock_level: 5,
    description: ''
});

const stockForm = ref({
    quantity: '',
    type: 'adjustment',
    notes: ''
});

const columns = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'category_id', label: 'Category', sortable: true },
    { key: 'stock_quantity', label: 'Stock', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
];

const categoryOptions = computed(() => {
    return productStore.categories.map(cat => ({
        value: cat.id,
        label: cat.name
    }));
});

const stockTypeOptions = [
    { value: 'in', label: 'Stock In' },
    { value: 'out', label: 'Stock Out' },
    { value: 'adjustment', label: 'Adjustment' }
];

onMounted(async () => {
    await productStore.fetchProducts();
    await productStore.fetchCategories();
});

const getCategoryName = (categoryId) => {
    const category = productStore.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
};

const getStockBadgeClass = (stock, minLevel) => {
    if (stock <= minLevel) return 'stock-low';
    if (stock <= minLevel * 2) return 'stock-medium';
    return 'stock-high';
};

const openProductModal = (product = null) => {
    editingProduct.value = product;
    if (product) {
        productForm.value = { ...product };
    } else {
        productForm.value = {
            name: '',
            sku: '',
            category_id: '',
            price: '',
            cost: '',
            stock_quantity: 0,
            min_stock_level: 5,
            description: ''
        };
    }
    showProductModal.value = true;
};

const openStockModal = (product) => {
    selectedProduct.value = product;
    stockForm.value = {
        quantity: '',
        type: 'adjustment',
        notes: ''
    };
    showStockModal.value = true;
};

const saveProduct = async () => {
    saving.value = true;
    try {
        if (editingProduct.value) {
            await productStore.updateProduct(editingProduct.value.id, productForm.value);
        } else {
            await productStore.createProduct(productForm.value);
        }
        showProductModal.value = false;
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product');
    } finally {
        saving.value = false;
    }
};

const adjustStock = async () => {
    saving.value = true;
    try {
        await productStore.adjustStock(selectedProduct.value.id, stockForm.value);
        showStockModal.value = false;
    } catch (error) {
        console.error('Error adjusting stock:', error);
        alert('Failed to adjust stock');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        try {
            await productStore.deleteProduct(product.id);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    }
};
</script>

<style scoped>
.inventory-view {
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

.product-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.product-info {
    flex: 1;
}

.product-name {
    font-weight: 600;
    color: var(--color-gray-900);
    margin: 0;
}

.product-sku {
    font-size: var(--font-size-sm);
    color: var(--color-gray-500);
    margin: 0;
}

.category-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--color-blue-100);
    color: var(--color-blue-700);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.stock-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.stock-low {
    background: #FEE2E2;
    color: #991B1B;
}

.stock-medium {
    background: #FEF3C7;
    color: #92400E;
}

.stock-high {
    background: #D1FAE5;
    color: #065F46;
}

.price-text {
    font-weight: 600;
    color: var(--color-gray-900);
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

.action-btn-stock {
    color: var(--color-warning);
}

.action-btn-stock:hover {
    background: var(--color-amber-50);
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

.stock-modal-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.current-stock {
    padding: 1rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
    text-align: center;
}

.current-stock .label {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin: 0 0 0.25rem 0;
}

.current-stock .value {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    color: var(--color-gray-900);
    margin: 0;
}
</style>
