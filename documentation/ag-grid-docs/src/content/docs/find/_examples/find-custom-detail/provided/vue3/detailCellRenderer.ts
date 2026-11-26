import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { FindPart, ICellRendererParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellRendererParams>,
            required: true,
        },
    },
    template: `<div role="gridcell">
        <h1 style="padding: 20px;">
            <template v-for="part in parts">
                <mark v-if="part.match" :class="['ag-find-match', part.activeMatch ? 'ag-find-active-match' : '']">{{ part.value }}</mark>
                <template v-if="!part.match">{{ part.value }}</template>
            </template>
        </h1>
    </div>`,
    data: function () {
        return {
            parts: [] as FindPart[],
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params: ICellRendererParams): boolean {
            this.updateDisplay(params);
            return true;
        },
        updateDisplay(params: ICellRendererParams): void {
            const { api, node } = params;
            const cellDisplayValue = 'My Custom Detail';
            const parts = api.findGetParts({
                value: cellDisplayValue,
                node,
                column: null,
            });
            this.parts = parts.length ? parts : [{ value: cellDisplayValue }];
        },
    },
});
