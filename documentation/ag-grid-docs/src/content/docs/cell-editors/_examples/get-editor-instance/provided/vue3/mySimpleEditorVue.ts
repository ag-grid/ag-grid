import { defineComponent, nextTick } from 'vue';
import type { PropType } from 'vue';

import type { ICellEditorParams } from 'ag-grid-community';

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellEditorParams>,
            required: true,
        },
    },
    template: `<input v-model="value" :ref="'input'" class="my-simple-editor" />`,
    data() {
        return {
            value: null as string | null,
        };
    },
    methods: {
        getValue(): string | null {
            return this.value;
        },

        myCustomFunction(): { rowIndex: number; colId: string } {
            return {
                rowIndex: this.params.rowIndex,
                colId: this.params.column.getId(),
            };
        },

        getInitialValue(): string {
            let startValue = this.params.value;

            const eventKey = this.params.eventKey;
            const isBackspace = eventKey === KEY_BACKSPACE;

            if (isBackspace) {
                startValue = '';
            } else if (eventKey && eventKey.length === 1) {
                startValue = eventKey;
            }

            if (startValue !== null && startValue !== undefined) {
                return startValue;
            }

            return '';
        },
    },
    created() {
        this.value = this.getInitialValue();
    },
    mounted() {
        nextTick(() => {
            (this.$refs.input as HTMLInputElement).focus();
        });
    },
});
