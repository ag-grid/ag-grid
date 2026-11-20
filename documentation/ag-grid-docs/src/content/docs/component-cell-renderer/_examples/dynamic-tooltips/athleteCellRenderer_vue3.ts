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
    template: `<div>{{ displayValue }}</div>`,
    data: function () {
        return {
            displayValue: '',
        };
    },
    beforeMount() {
        this.displayValue = this.params.value;
        this.params.setTooltip('Won more than one gold medal at these Games', () => this.params.data.gold > 1);
    },
});
