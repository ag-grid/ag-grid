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
    template: `
    <a :href="value" target="_blank">{{ parsedValue }}</a>
  `,
    data: function () {
        return {
            parsedValue: '',
            value: '',
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params: ICellRendererParams) {
            this.updateDisplay(params);
        },
        updateDisplay(params: ICellRendererParams) {
            this.value = params.value;
            this.parsedValue = new URL(params.value).hostname;
        },
    },
});
