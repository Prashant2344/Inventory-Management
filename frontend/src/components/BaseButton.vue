<template>
    <button 
        :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-icon-only': iconOnly, 'btn-loading': loading }]" 
        :disabled="disabled || loading"
        @click="$emit('click', $event)"
    >
        <span v-if="loading" class="btn-spinner"></span>
        <component v-if="icon && !loading" :is="icon" class="btn-icon" />
        <span v-if="$slots.default && !iconOnly" class="btn-text"><slot /></span>
    </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'outline'].includes(value)
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    loading: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    icon: {
        type: Object,
        default: null
    },
    iconOnly: {
        type: Boolean,
        default: false
    }
});

defineEmits(['click']);
</script>

<style scoped>
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-weight: 600;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.btn:active:not(:disabled) {
    transform: scale(0.98);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

/* Sizes */
.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
}

.btn-md {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
}

.btn-lg {
    padding: 1rem 2rem;
    font-size: 1rem;
}

/* Icon only sizes */
.btn-icon-only.btn-sm {
    padding: 0.5rem;
}

.btn-icon-only.btn-md {
    padding: 0.75rem;
}

.btn-icon-only.btn-lg {
    padding: 1rem;
}

/* Icon */
.btn-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.btn-sm .btn-icon {
    width: 16px;
    height: 16px;
}

.btn-lg .btn-icon {
    width: 20px;
    height: 20px;
}

/* Variants */
.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
}

.btn-primary:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
    transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
}

.btn-secondary {
    background: linear-gradient(135deg, #475569 0%, #334155 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(71, 85, 105, 0.3);
}

.btn-secondary:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(71, 85, 105, 0.4);
    transform: translateY(-2px);
}

.btn-success {
    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-success:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    transform: translateY(-2px);
}

.btn-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}

.btn-warning:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
    transform: translateY(-2px);
}

.btn-danger {
    background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.btn-danger:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
    transform: translateY(-2px);
}

.btn-ghost {
    background: transparent;
    color: #64748b;
}

.btn-ghost:hover:not(:disabled) {
    background: #f1f5f9;
    color: #334155;
}

.btn-outline {
    background: transparent;
    border: 2px solid #3b82f6;
    color: #3b82f6;
}

.btn-outline:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.08);
}

/* Loading spinner */
.btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.btn-ghost .btn-spinner,
.btn-outline .btn-spinner {
    border-color: rgba(59, 130, 246, 0.3);
    border-top-color: #3b82f6;
}

.btn-loading {
    pointer-events: none;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Ripple effect on click */
.btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: opacity 0.3s, transform 0.3s;
}

.btn:active::after {
    opacity: 1;
    transform: scale(2);
    transition: opacity 0s, transform 0s;
}
</style>
