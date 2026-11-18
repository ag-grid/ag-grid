import { defineComponent, nextTick } from 'vue';
import type { PropType } from 'vue';

import type { ICellEditorParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellEditorParams>,
            required: true,
        },
    },
    template: `
      <input
        ref="input"
        type="text"
        class="phone-cell-editor"
        placeholder="(123) 456-7890"
        v-model="value"
        @input="validatePhone"
        @blur="validatePhone"
        :pattern="pattern"
      />
    `,

    data() {
        return {
            value: '',
            validationError: null as string | null,
            pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
        };
    },

    methods: {
        getValue(): string {
            return this.value;
        },

        afterGuiAttached() {
            nextTick(() => {
                const input = this.$refs.input as HTMLInputElement;
                input.focus();
                input.select();

                const { cellStartedEdit, eventKey } = this.params;

                if (cellStartedEdit && eventKey?.length === 1) {
                    input.value = eventKey;
                }
            });
        },

        isCancelAfterEnd() {
            return false;
        },

        getValidationErrors(): string[] | null {
            return this.validationError ? [this.validationError] : null;
        },

        getValidationElement(): HTMLInputElement {
            return this.$refs.input as HTMLInputElement;
        },

        validatePhone() {
            const trimmed = this.value.trim();
            const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

            if (!phoneRegex.test(trimmed)) {
                this.validationError = 'Invalid phone format. Use (123) 456-7890';
            } else {
                this.validationError = null;
            }

            this.params.validate?.();
        },
    },

    created() {
        this.value = this.params.value || '';
    },
});
