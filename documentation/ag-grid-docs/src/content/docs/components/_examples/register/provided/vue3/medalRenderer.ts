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
            <span class="total-value-renderer">
             <span>{{country}}</span>
             <button @click="buttonClicked($event)">Push For Total</button>
        </span>
`,
    data: function () {
        return {
            country: '',
            total: '',
        };
    },
    beforeMount() {
        this.country = this.params.valueFormatted ? this.params.valueFormatted : this.params.value;
        this.total = this.params.data.total;
    },
    methods: {
        buttonClicked() {
            console.log(`${this.total} medals won!`);
        },
    },
});
