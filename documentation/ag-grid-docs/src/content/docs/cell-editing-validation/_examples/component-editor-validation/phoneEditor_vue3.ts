import { nextTick } from 'vue';

export default {
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
            validationError: null,
            pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
        };
    },

    methods: {
        getValue() {
            return this.value;
        },

        afterGuiAttached() {
            nextTick(() => {
                this.$refs.input.focus();
                this.$refs.input.select();
            });
        },

        isCancelAfterEnd() {
            return false;
        },

        getValidationErrors() {
            return this.validationError ? [this.validationError] : null;
        },

        getValidationElement() {
            return this.$refs.input;
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
};
