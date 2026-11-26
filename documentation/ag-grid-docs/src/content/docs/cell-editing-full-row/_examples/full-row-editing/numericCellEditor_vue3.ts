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
    template: `<input :ref="'input'" @keydown="onKeyDown($event)" v-model="value" class="ag-input-field-input" />`,
    data() {
        return {
            value: '' as string | null,
            focusAfterAttached: false,
        };
    },
    methods: {
        getValue(): number | null {
            const value = this.value;
            return value === '' || value == null ? null : parseInt(value);
        },

        onKeyDown(event: KeyboardEvent) {
            if (!event.key || event.key.length !== 1 || this.isNumericKey(event)) {
                return;
            }
            (this.$refs.input as HTMLInputElement).focus();

            if (event.preventDefault) event.preventDefault();
        },

        // when we tab into this editor, we want to focus the contents
        focusIn() {
            const input = this.$refs.input as HTMLInputElement;
            input.focus();
            input.select();
            console.log('NumericCellEditor.focusIn()');
        },

        // when we tab out of the editor, this gets called
        focusOut() {
            console.log('NumericCellEditor.focusOut()');
        },

        isCharNumeric(charStr: string | null): boolean {
            return charStr != null && !!/^\d+$/.test(charStr);
        },

        isNumericKey(event: KeyboardEvent): boolean {
            const charStr = event.key;
            return this.isCharNumeric(charStr);
        },
    },

    created() {
        // we only want to highlight this cell if it started the edit; it's possible
        // another cell in this row started the edit
        this.focusAfterAttached = this.params.cellStartedEdit;

        this.value = this.isCharNumeric(this.params.eventKey) ? this.params.eventKey : this.params.value;
    },
    mounted() {
        nextTick(() => {
            const input = this.$refs.input as HTMLInputElement | undefined;
            if (input) {
                if (this.focusAfterAttached) {
                    input.focus();
                    input.select();
                }
            }
        });
    },
});
