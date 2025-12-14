<template>
    <div class="input-wrapper">
        <label v-if="label" :for="inputId" class="input-label">
            {{ label }}
            <span v-if="required" class="required-star">*</span>
        </label>
        
        <div class="input-container" :class="containerClasses">
            <component 
                v-if="iconLeft" 
                :is="iconLeft" 
                class="input-icon input-icon-left"
            />
            
            <input
                v-if="type !== 'textarea' && type !== 'select'"
                :id="inputId"
                :type="type"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                class="input-field"
                :class="{ 'has-icon-left': iconLeft, 'has-icon-right': iconRight, 'has-error': error }"
                @input="$emit('update:modelValue', $event.target.value)"
                @blur="$emit('blur', $event)"
                @focus="$emit('focus', $event)"
            />
            
            <textarea
                v-else-if="type === 'textarea'"
                :id="inputId"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :rows="rows"
                class="input-field textarea-field"
                :class="{ 'has-error': error }"
                @input="$emit('update:modelValue', $event.target.value)"
                @blur="$emit('blur', $event)"
                @focus="$emit('focus', $event)"
            ></textarea>
            
            <div v-else-if="type === 'select'" class="select-wrapper">
                <select
                    :id="inputId"
                    :value="modelValue"
                    :disabled="disabled"
                    :required="required"
                    class="input-field select-field"
                    :class="{ 'has-error': error }"
                    @change="$emit('update:modelValue', $event.target.value)"
                    @blur="$emit('blur', $event)"
                    @focus="$emit('focus', $event)"
                >
                    <option value="" disabled>{{ placeholder || 'Select an option' }}</option>
                    <option 
                        v-for="option in options" 
                        :key="option.value" 
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>
                <div class="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            
            <component 
                v-if="iconRight" 
                :is="iconRight" 
                class="input-icon input-icon-right"
            />
        </div>
        
        <p v-if="error" class="input-error">{{ error }}</p>
        <p v-else-if="hint" class="input-hint">{{ hint }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    },
    hint: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    iconLeft: {
        type: Object,
        default: null
    },
    iconRight: {
        type: Object,
        default: null
    },
    rows: {
        type: Number,
        default: 4
    },
    options: {
        type: Array,
        default: () => []
    }
});

defineEmits(['update:modelValue', 'blur', 'focus']);

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

const containerClasses = computed(() => ({
    'container-disabled': props.disabled,
    'container-error': props.error
}));
</script>

<style scoped>
.input-wrapper {
    margin-bottom: 1.25rem;
}

.input-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
}

.required-star {
    color: #ef4444;
    margin-left: 0.125rem;
}

.input-container {
    position: relative;
}

.input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    font-family: inherit;
    color: #1f2937;
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    outline: none;
    transition: all 0.2s ease;
}

.input-field::placeholder {
    color: #9ca3af;
}

.input-field:hover:not(:disabled) {
    border-color: #d1d5db;
}

.input-field:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-field:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.input-field.has-error {
    border-color: #ef4444;
}

.input-field.has-error:focus {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.input-field.has-icon-left {
    padding-left: 2.75rem;
}

.input-field.has-icon-right {
    padding-right: 2.75rem;
}

/* Textarea */
.textarea-field {
    resize: vertical;
    min-height: 100px;
    line-height: 1.5;
}

/* Select */
.select-wrapper {
    position: relative;
}

.select-field {
    appearance: none;
    padding-right: 2.75rem;
    cursor: pointer;
    background: #ffffff;
}

.select-field option {
    padding: 0.5rem;
}

.select-arrow {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    pointer-events: none;
    transition: transform 0.2s ease;
}

.select-field:focus + .select-arrow {
    color: #3b82f6;
}

/* Icons */
.input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #9ca3af;
    pointer-events: none;
    transition: color 0.2s ease;
}

.input-icon-left {
    left: 0.875rem;
}

.input-icon-right {
    right: 0.875rem;
}

.input-field:focus ~ .input-icon {
    color: #3b82f6;
}

/* Error & Hint */
.input-error {
    margin: 0.375rem 0 0;
    font-size: 0.8125rem;
    color: #ef4444;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.input-hint {
    margin: 0.375rem 0 0;
    font-size: 0.8125rem;
    color: #6b7280;
}

/* Number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
    height: 28px;
}
</style>
