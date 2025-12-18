<template>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                        <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                        <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
                <div class="logo-text">
                    <span class="logo-name">Inventory</span>
                    <span class="logo-accent">Pro</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <router-link to="/" class="nav-item" active-class="nav-item-active">
                    <component :is="LayoutDashboard" class="nav-icon" />
                    <span>Dashboard</span>
                </router-link>

                <router-link to="/inventory" class="nav-item" active-class="nav-item-active">
                    <component :is="Package" class="nav-icon" />
                    <span>Inventory</span>
                </router-link>

                <router-link to="/categories" class="nav-item" active-class="nav-item-active">
                    <component :is="Layers" class="nav-icon" />
                    <span>Categories</span>
                </router-link>

                <router-link to="/sales" class="nav-item" active-class="nav-item-active">
                    <component :is="ShoppingCart" class="nav-icon" />
                    <span>Sales / POS</span>
                </router-link>

                <router-link to="/clients" class="nav-item" active-class="nav-item-active">
                    <component :is="Users" class="nav-icon" />
                    <span>Clients</span>
                </router-link>

                <router-link to="/transactions" class="nav-item" active-class="nav-item-active">
                    <component :is="History" class="nav-icon" />
                    <span>Transactions</span>
                </router-link>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <span>A</span>
                    </div>
                    <div class="user-details">
                        <p class="user-name">Admin User</p>
                        <p class="user-email">admin@example.com</p>
                    </div>
                    <button class="logout-btn" title="Settings">
                        <component :is="Settings" class="nav-icon" />
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="top-header">
                <div class="header-left">
                    <h2 class="page-title">{{ $route.name }}</h2>
                    <p class="page-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
                <div class="header-right">
                    <div class="search-box">
                        <component :is="Search" class="search-icon" />
                        <input type="text" placeholder="Search..." class="search-input" />
                    </div>
                    <button class="header-btn notification-btn">
                        <component :is="Bell" class="header-btn-icon" />
                        <span class="notification-badge">3</span>
                    </button>
                    <button class="header-btn">
                        <component :is="Settings" class="header-btn-icon" />
                    </button>
                </div>
            </header>

            <div class="page-content">
                <router-view></router-view>
            </div>
        </main>
    </div>
</template>

<script setup>
import { LayoutDashboard, Package, Layers, Users, ShoppingCart, History, Bell, Settings, Search } from 'lucide-vue-next';
</script>

<style scoped>
.app-container {
    display: flex;
    height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    overflow: hidden;
}

/* Sidebar */
.sidebar {
    width: 280px;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    z-index: 100;
}

.sidebar-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.logo-text {
    display: flex;
    gap: 0.25rem;
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.logo-name {
    color: white;
}

.logo-accent {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Navigation */
.sidebar-nav {
    flex: 1;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1rem;
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    border-radius: 12px;
    font-weight: 500;
    font-size: 0.9375rem;
    transition: all 0.2s ease;
    position: relative;
}

.nav-item:hover {
    color: white;
    background: rgba(255, 255, 255, 0.08);
}

.nav-item-active {
    color: white;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.nav-item-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 0 4px 4px 0;
}

.nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

/* Sidebar Footer */
.sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    flex-shrink: 0;
}

.user-details {
    flex: 1;
    min-width: 0;
}

.user-name {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
}

.user-email {
    margin: 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.logout-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
}

/* Main Content Area */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Top Header */
.top-header {
    background: white;
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.page-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.02em;
}

.page-subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 14px;
    width: 18px;
    height: 18px;
    color: #94a3b8;
    pointer-events: none;
}

.search-input {
    width: 280px;
    padding: 0.625rem 0.875rem 0.625rem 2.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.875rem;
    background: #f8fafc;
    color: #1e293b;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.search-input::placeholder {
    color: #94a3b8;
}

.header-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.header-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.header-btn-icon {
    width: 20px;
    height: 20px;
}

.notification-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
    border-radius: 50%;
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
}

/* Page Content */
.page-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}
</style>
