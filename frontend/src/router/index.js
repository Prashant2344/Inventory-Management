import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    // Placeholders for now
    {
        path: '/inventory',
        name: 'Inventory',
        component: () => import('../views/Inventory.vue')
    },
    {
        path: '/clients',
        name: 'Clients',
        component: () => import('../views/Clients.vue')
    },
    {
        path: '/sales',
        name: 'Sales',
        component: () => import('../views/Sales.vue')
    },
    {
        path: '/transactions',
        name: 'Transactions',
        component: () => import('../views/Transactions.vue')
    },
    {
        path: '/categories',
        name: 'Categories',
        component: () => import('../views/Category.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
