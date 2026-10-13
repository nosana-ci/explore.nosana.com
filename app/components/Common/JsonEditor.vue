<template>
  <JsonEditorVue
    :class="{ 'jse-theme-dark': colorMode.value === 'dark' }"
    :mode="Mode.text"
    :mainMenuBar="false"
    :statusBar="validateJobDefinition || !!validator"
    :stringified="false"
    :askToFormat="false"
    :validator="internalValidator"
    v-model="model"
    v-bind="$attrs"
    class="json-editor"
  />
</template>

<script setup lang="ts">
import { Mode, ValidationSeverity } from 'vanilla-jsoneditor';
import JsonEditorVue from 'json-editor-vue';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

const colorMode = useColorMode();

interface ValidationError {
  path: (string | number)[];
  message: string;
  severity: ValidationSeverity;
}

interface Props {
  modelValue: any;
  validator?: (json: any) => ValidationError[];
  /** Enable built-in job definition validation */
  validateJobDefinition?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  validator: undefined,
  validateJobDefinition: false,
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    // Track if value is a string or undefined (indicates JSON parse error)
    // When there's a syntax error, the editor returns the text content as a string
    hasSyntaxError.value = typeof val === 'string' || val === undefined;
    emit('update:modelValue', val);
  },
});

// Track validation errors
const validationErrors = ref<ValidationError[]>([]);

// Track JSON syntax errors
const hasSyntaxError = ref(false);

// Expose whether there are any errors (validation OR syntax)
const hasErrors = computed(() => validationErrors.value.length > 0 || hasSyntaxError.value);

/**
 * Built-in job definition validator
 */
function jobDefinitionValidator(json: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!json || typeof json !== 'object') {
    errors.push({ path: [], message: 'Job definition must be an object', severity: ValidationSeverity.error });
    return errors;
  }

  // Check version
  if (!json.version) {
    errors.push({ path: ['version'], message: 'Missing required field: version', severity: ValidationSeverity.error });
  }

  // Check type
  if (!json.type) {
    errors.push({ path: ['type'], message: 'Missing required field: type', severity: ValidationSeverity.error });
  } else if (json.type !== 'container') {
    errors.push({ path: ['type'], message: 'Type must be "container"', severity: ValidationSeverity.error });
  }

  // Check ops
  if (!json.ops) {
    errors.push({ path: ['ops'], message: 'Missing required field: ops', severity: ValidationSeverity.error });
  } else if (!Array.isArray(json.ops)) {
    errors.push({ path: ['ops'], message: 'ops must be an array', severity: ValidationSeverity.error });
  } else if (json.ops.length === 0) {
    errors.push({ path: ['ops'], message: 'ops must contain at least one operation', severity: ValidationSeverity.error });
  } else {
    // Validate each operation
    json.ops.forEach((op: any, index: number) => {
      if (!op.type) {
        errors.push({ path: ['ops', index, 'type'], message: `Operation ${index + 1}: missing type`, severity: ValidationSeverity.error });
      }
      if (!op.id && op.id !== '') {
        errors.push({ path: ['ops', index, 'id'], message: `Operation ${index + 1}: missing id`, severity: ValidationSeverity.error });
      }
      if (op.type === 'container/run' && op.args) {
        if (!op.args.image) {
          errors.push({ path: ['ops', index, 'args', 'image'], message: `Operation ${index + 1}: missing image`, severity: ValidationSeverity.error });
        }
      }
    });
  }

  return errors;
}

// Wrapper validator that tracks errors
const wrappedValidator = (json: any): ValidationError[] => {
  // Validator only called when JSON is valid (not a parse error)
  if (typeof json !== 'object' || json === null) {
    validationErrors.value = [];
    return [];
  }
  
  const errors = props.validateJobDefinition 
    ? jobDefinitionValidator(json)
    : props.validator?.(json) ?? [];
  
  validationErrors.value = errors;
  return errors;
};

// Use wrapped validator
const internalValidator = computed(() => wrappedValidator);

// Expose hasErrors to parent components
defineExpose({
  hasErrors,
});
</script>

<style lang="scss">
/* Hide only repair buttons - keep error messages visible */
.jse-actions button,
.jse-repair,
.jse-repair-button,
button[class*="repair"],
.cm-diagnosticAction {
  display: none !important;
}

/* Editor theme shared with the Deploy UI: One Dark on the code surface in dark
   mode, One Light on white in light mode. */
.json-editor {
  --jse-font-family-mono: "JetBrains Mono", monospace;
  border-radius: 10px;
  overflow: hidden;
}
.json-editor .cm-gutters {
  display: none !important;
}
.json-editor .cm-cursor {
  border-left-color: #58a6ff;
}

/* --- DARK --- */
.json-editor.jse-theme-dark {
  --jse-background-color: #{$code-surface};
  --jse-panel-background: #{$code-surface-panel};
  --jse-panel-border: #{$code-surface-border};
  --jse-panel-color: #c9d1d9;
  --jse-panel-color-readonly: #6e7681;
  --jse-main-border: #{$code-surface-border};
  --jse-text-color: #c9d1d9;
  --jse-value-color: #c9d1d9;
  --jse-key-color: #e06c75;
  --jse-value-color-string: #98c379;
  --jse-value-color-number: #d19a66;
  --jse-value-color-boolean: #c678dd;
  --jse-value-color-null: #c678dd;
  --jse-value-color-url: #56b6c2;
  --jse-delimiter-color: #7f8896;
  --jse-selection-background-color: rgba(88, 166, 255, 0.4);
  --jse-selection-background-inactive-color: rgba(88, 166, 255, 0.24);
  --jse-active-line-background-color: rgba(255, 255, 255, 0.03);
  --jse-input-background: #{$code-surface-panel};
  border: 1px solid $code-surface-border;
}
/* Paint the surface on the containers, not .cm-content: CodeMirror draws the
   selection behind the content, so an opaque .cm-content would hide it. */
.json-editor.jse-theme-dark .jse-text-mode,
.json-editor.jse-theme-dark .cm-editor,
.json-editor.jse-theme-dark .cm-scroller {
  background: $code-surface;
}
.json-editor.jse-theme-dark .cm-content {
  background: transparent;
}

/* --- LIGHT (default) --- */
.json-editor:not(.jse-theme-dark) {
  --jse-text-color: #1a1a1a;
  --jse-value-color: #1a1a1a;
  --jse-key-color: #b31d28;
  --jse-value-color-string: #50a14f;
  --jse-value-color-number: #986801;
  --jse-value-color-boolean: #a626a4;
  --jse-value-color-null: #a626a4;
  --jse-value-color-url: #4078f2;
  --jse-delimiter-color: #a0a1a7;
  --jse-selection-background-color: rgba(88, 166, 255, 0.28);
  --jse-selection-background-inactive-color: rgba(88, 166, 255, 0.18);
  --jse-active-line-background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid $border-soft;
}
.json-editor:not(.jse-theme-dark) .jse-text-mode,
.json-editor:not(.jse-theme-dark) .cm-editor,
.json-editor:not(.jse-theme-dark) .cm-scroller {
  background: $white;
}
.json-editor:not(.jse-theme-dark) .cm-content {
  background: transparent;
}
</style>

