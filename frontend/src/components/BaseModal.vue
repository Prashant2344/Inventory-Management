<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="modelValue" class="modal-backdrop" @click="handleBackdropClick">
                <div class="modal-container" :class="sizeClass" @click.stop>
                    <div class="modal-header">
                        <div class="modal-header-content">
                            <div class="modal-icon">
                                <slot name="icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="12" y1="18" x2="12" y2="12"></line>
                                        <line x1="9" y1="15" x2="15" y2="15"></line>
                                    </svg>
                                </slot>
                            </div>
                            <h3 class="modal-title">{{ title }}</h3>
                        </div>
                        <button 
                            class="modal-close" 
                            @click="close"
                            aria-label="Close modal"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <slot />
                    </div>
                    
                    <div v-if="$slots.footer" class="modal-footer">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: 'Modal'
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true
    },
    closeOnEscape: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'close']);

const sizeClass = computed(() => `modal-${props.size}`);

const close = () => {
    emit('update:modelValue', false);
    emit('close');
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        close();
    }
};

const handleEscape = (e) => {
    if (e.key === 'Escape' && props.closeOnEscape && props.modelValue) {
        close();
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
}

.modal-container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modalSlideIn 0.3s ease-out;
}

/* Sizes */
.modal-sm {
    max-width: 400px;
}

.modal-md {
    max-width: 560px;
}

.modal-lg {
    max-width: 720px;
}

.modal-xl {
    max-width: 900px;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(to bottom, #fafbfc, #ffffff);
}

.modal-header-content {
    display: flex;
    align-items: center;
    gap: 0.875rem;
}

.modal-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.01em;
}

.modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: #f1f5f9;
    color: #475569;
}

.modal-close:active {
    transform: scale(0.95);
}

.modal-body {
    padding: 1.75rem;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 1.25rem 1.75rem;
    border-top: 1px solid #f1f5f9;
    background: #fafbfc;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-container {
    animation: modalSlideIn 0.3s ease-out;
}

.modal-leave-active .modal-container {
    animation: modalSlideOut 0.2s ease-in;
}

@keyframes modalSlideOut {
    from {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    to {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
    }
}
</style>
