import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { ICellRendererParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellRendererParams>,
            required: true,
        },
    },
    template: `<span>
        <button id="theButton" style="height: 30px;" @click="onClick">✎</button>
        <span id="theValue" style="padding-left: 4px;">{{displayValue}}</span>
    </span>`,

    data() {
        return {
            displayValue: '',
        };
    },
    beforeMount() {
        this.displayValue = this.params.value;
    },
    methods: {
        onClick() {
            this.params.api.startEditingCell({
                rowIndex: this.params.node.rowIndex!,
                colKey: this.params.column!.getId(),
            });
        },
    },
});
