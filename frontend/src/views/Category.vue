<template>
  <div class="category-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h2 class="view-title">Category Management</h2>
        <p class="view-subtitle">Manage product categories</p>
      </div>
      <BaseButton :icon="'Plus'" @click="openCategoryModal()">
        Add Category
      </BaseButton>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <component :is="'Layers'" class="stat-icon text-blue-600" />
        <div>
          <p class="stat-label">Total Categories</p>
          <p class="stat-value">{{ categoryStore.totalCategories }}</p>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <DataTable
      :columns="columns"
      :data="categoryStore.categories"
      :loading="categoryStore.loading"
    >
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="categoryStore.fetchCategories()">
          Refresh
        </BaseButton>
      </template>

      <template #cell-name="{ row }">
        <div class="category-name">{{ row.name }}</div>
      </template>

      <template #cell-type="{ row }">
        <span class="type-badge" :class="'type-' + row.type">
          {{ row.type }}
        </span>
      </template>

      <template #cell-description="{ row }">
        <div class="category-description">{{ row.description }}</div>
      </template>

      <template #row-actions="{ row }">
        <div class="action-buttons">
          <button class="action-btn action-btn-edit" @click="openCategoryModal(row)" title="Edit">
            <component :is="'Edit'" class="w-4 h-4" />
          </button>
          <button class="action-btn action-btn-delete" @click="confirmDelete(row)" title="Delete">
            <component :is="'Trash2'" class="w-4 h-4" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Category Modal -->
    <BaseModal v-model="showCategoryModal" :title="editingCategory ? 'Edit Category' : 'Add Category'">
      <form @submit.prevent="saveCategory">
        <BaseInput v-model="categoryForm.name" label="Name" placeholder="Category name" required />
        <BaseInput 
          v-model="categoryForm.type" 
          label="Type" 
          type="select" 
          :options="categoryTypeOptions" 
          required 
        />
        <BaseInput v-model="categoryForm.description" label="Description" placeholder="Category description" type="textarea" :rows="3" />
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showCategoryModal = false">Cancel</BaseButton>
        <BaseButton @click="saveCategory" :loading="saving">
          {{ editingCategory ? 'Update' : 'Create' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseModal from '../components/BaseModal.vue';
import DataTable from '../components/DataTable.vue';
import { Plus, Edit, Trash2, Layers } from 'lucide-vue-next';

const categoryStore = useCategoryStore();

const showCategoryModal = ref(false);
const editingCategory = ref(null);
const saving = ref(false);

const categoryForm = ref({
  name: '',
  description: '',
  type: 'product'
});

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'actions', label: 'Actions' }
];

const categoryTypeOptions = [
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' }
];

onMounted(async () => {
  await categoryStore.fetchCategories();
});

const openCategoryModal = (category = null) => {
  editingCategory.value = category;
  if (category) {
    categoryForm.value = { ...category };
  } else {
    categoryForm.value = { name: '', description: '', type: 'product' };
  }
  showCategoryModal.value = true;
};

const saveCategory = async () => {
  saving.value = true;
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, categoryForm.value);
    } else {
      await categoryStore.createCategory(categoryForm.value);
    }
    showCategoryModal.value = false;
  } catch (error) {
    console.error('Error saving category:', error);
    alert('Failed to save category');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (category) => {
  if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
    try {
      await categoryStore.deleteCategory(category.id);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  }
};
</script>

<style scoped>
.category-view {
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

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
}

.type-product {
  background: #DBEAFE;
  color: #1E40AF;
}

.type-service {
  background: #F3E8FF;
  color: #6B21A8;
}
</style>
