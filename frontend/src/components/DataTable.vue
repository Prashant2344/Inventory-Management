<template>
    <div class="data-table-wrapper">
        <!-- Search and Actions -->
        <div v-if="searchable || $slots.actions" class="table-header">
            <div v-if="searchable" class="search-container">
                <component :is="Search" class="search-icon" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search..."
                    class="search-input"
                />
            </div>
            <div v-if="$slots.actions" class="table-actions">
                <slot name="actions" />
            </div>
        </div>
        
        <!-- Table -->
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th 
                            v-for="column in columns" 
                            :key="column.key"
                            :class="{ 'sortable': column.sortable }"
                            @click="column.sortable && handleSort(column.key)"
                        >
                            <div class="th-content">
                                {{ column.label }}
                                <component 
                                    v-if="column.sortable && sortKey === column.key"
                                    :is="sortOrder === 'asc' ? ChevronUp : ChevronDown"
                                    class="sort-icon"
                                />
                            </div>
                        </th>
                        <th v-if="$slots.actions" class="actions-column">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="loading-cell">
                            <div class="spinner"></div>
                            <span>Loading...</span>
                        </td>
                    </tr>
                    <tr v-else-if="paginatedData.length === 0">
                        <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-cell">
                            No data available
                        </td>
                    </tr>
                    <tr v-else v-for="(row, index) in paginatedData" :key="index" class="data-row">
                        <td v-for="column in columns" :key="column.key">
                            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                                {{ row[column.key] }}
                            </slot>
                        </td>
                        <td v-if="$slots.actions" class="actions-cell">
                            <slot name="row-actions" :row="row" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="paginated && filteredData.length > perPage" class="pagination">
            <button 
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
            >
                <component :is="ChevronLeft" class="w-4 h-4" />
            </button>
            
            <span class="pagination-info">
                Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button 
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
            >
                <component :is="ChevronRight" class="w-4 h-4" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
    columns: {
        type: Array,
        required: true
    },
    data: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    searchable: {
        type: Boolean,
        default: true
    },
    paginated: {
        type: Boolean,
        default: true
    },
    perPage: {
        type: Number,
        default: 10
    }
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref('asc');
const currentPage = ref(1);

const filteredData = computed(() => {
    let data = [...props.data];
    
    // Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        data = data.filter(row => {
            return props.columns.some(column => {
                const value = row[column.key];
                return value && value.toString().toLowerCase().includes(query);
            });
        });
    }
    
    // Sort
    if (sortKey.value) {
        data.sort((a, b) => {
            const aVal = a[sortKey.value];
            const bVal = b[sortKey.value];
            
            if (aVal === bVal) return 0;
            
            const comparison = aVal > bVal ? 1 : -1;
            return sortOrder.value === 'asc' ? comparison : -comparison;
        });
    }
    
    return data;
});

const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / props.perPage);
});

const paginatedData = computed(() => {
    if (!props.paginated) return filteredData.value;
    
    const start = (currentPage.value - 1) * props.perPage;
    const end = start + props.perPage;
    return filteredData.value.slice(start, end);
});

const handleSort = (key) => {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
};
</script>

<style scoped>
.data-table-wrapper {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
}

.table-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.search-container {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-gray-400);
}

.search-input {
    width: 100%;
    padding: 0.625rem 0.75rem 0.625rem 2.5rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    transition: all var(--transition-base);
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-actions {
    display: flex;
    gap: 0.5rem;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: var(--color-gray-50);
}

.data-table th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-gray-700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.data-table th.sortable {
    cursor: pointer;
    user-select: none;
}

.data-table th.sortable:hover {
    background: var(--color-gray-100);
}

.th-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.sort-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-primary);
}

.data-table td {
    padding: 1rem 1.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-gray-900);
    border-top: 1px solid var(--color-gray-200);
}

.data-row {
    transition: background-color var(--transition-fast);
}

.data-row:hover {
    background: var(--color-gray-50);
}

.actions-column,
.actions-cell {
    width: 100px;
    text-align: right;
}

.loading-cell,
.empty-cell {
    text-align: center;
    padding: 3rem 1.5rem;
    color: var(--color-gray-500);
}

.loading-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.pagination {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-gray-200);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.pagination-btn {
    padding: 0.5rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    background: white;
    color: var(--color-gray-700);
    transition: all var(--transition-base);
}

.pagination-btn:hover:not(:disabled) {
    background: var(--color-gray-50);
    border-color: var(--color-gray-400);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
}
</style>
