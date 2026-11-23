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
        <span class="imgSpan">
            <img v-for="images in arr" :src="src" class="medalIcon" />
        </span>
    `,
    data: function () {
        return {
            arr: [] as undefined[],
            src: 'https://www.ag-grid.com/example-assets/gold-star.png',
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
            this.arr = new Array(params.value ?? 0);
        },
    },
});
