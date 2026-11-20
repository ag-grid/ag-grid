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
    <span class="imgSpanLogo">
      <img :src="'https://www.ag-grid.com/example-assets/software-company-logos/' + cellValueLowerCase + '.svg'" class="logo" />
    </span>
    `,
    data: function () {
        return {
            cellValue: '',
            cellValueLowerCase: '',
        };
    },
    beforeMount() {
        this.cellValue = this.params.value;
        this.cellValueLowerCase = this.params.value.toLowerCase();
    },
});
