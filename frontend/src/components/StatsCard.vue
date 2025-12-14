<template>
    <div class="stats-card" :class="variantClass">
        <div class="stats-card-content">
            <div class="stats-card-icon" :class="iconClass">
                <component :is="icon" class="icon" />
            </div>
            
            <div class="stats-card-info">
                <p class="stats-label">{{ label }}</p>
                <h3 class="stats-value">{{ formattedValue }}</h3>
                
                <div v-if="trend !== null" class="stats-trend" :class="trendClass">
                    <component :is="trendIcon" class="trend-icon" />
                    <span>{{ Math.abs(trend) }}% vs last month</span>
                </div>
            </div>
        </div>
        
        <div class="stats-card-decoration">
            <svg viewBox="0 0 100 100" class="decoration-circle">
                <circle cx="80" cy="20" r="60" />
            </svg>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: [String, Number],
        required: true
    },
    icon: {
        type: Object,
        required: true
    },
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
    },
    trend: {
        type: Number,
        default: null
    },
    prefix: {
        type: String,
        default: ''
    },
    suffix: {
        type: String,
        default: ''
    }
});

const formattedValue = computed(() => {
    return `${props.prefix}${props.value}${props.suffix}`;
});

const variantClass = computed(() => `card-${props.variant}`);

const iconClass = computed(() => `icon-${props.variant}`);

const trendIcon = computed(() => {
    return props.trend >= 0 ? TrendingUp : TrendingDown;
});

const trendClass = computed(() => {
    return props.trend >= 0 ? 'trend-positive' : 'trend-negative';
});
</script>

<style scoped>
.stats-card {
    position: relative;
    background: white;
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.stats-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stats-card-content {
    display: flex;
    gap: 1.25rem;
    position: relative;
    z-index: 1;
}

.stats-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.stats-card:hover .stats-card-icon {
    transform: scale(1.1);
}

.icon {
    width: 26px;
    height: 26px;
    color: white;
}

/* Icon Variants */
.icon-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.icon-success {
    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.icon-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
}

.icon-danger {
    background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.stats-card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.stats-label {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 0.01em;
}

.stats-value {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.1;
}

.stats-trend {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-top: 0.25rem;
}

.trend-icon {
    width: 16px;
    height: 16px;
}

.trend-positive {
    color: #10b981;
}

.trend-negative {
    color: #ef4444;
}

/* Decoration */
.stats-card-decoration {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 120px;
    height: 120px;
    opacity: 0.08;
    transition: opacity 0.3s ease;
}

.stats-card:hover .stats-card-decoration {
    opacity: 0.12;
}

.decoration-circle {
    width: 100%;
    height: 100%;
}

.card-primary .decoration-circle circle {
    fill: #3b82f6;
}

.card-success .decoration-circle circle {
    fill: #10b981;
}

.card-warning .decoration-circle circle {
    fill: #f59e0b;
}

.card-danger .decoration-circle circle {
    fill: #ef4444;
}

/* Card bottom accent */
.stats-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stats-card:hover::after {
    opacity: 1;
}

.card-primary::after {
    background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
}

.card-success::after {
    background: linear-gradient(90deg, #10b981 0%, #14b8a6 100%);
}

.card-warning::after {
    background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
}

.card-danger::after {
    background: linear-gradient(90deg, #ef4444 0%, #f43f5e 100%);
}
</style>
