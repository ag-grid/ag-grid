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
    <span class="missionSpan">
      <img
        :alt="params.value"
        :src="'https://www.ag-grid.com/example-assets/icons/' + cellValue + '.png'"
        class="missionIcon"
      />
    </span>
    `,
    data: function () {
        return {
            cellValue: '',
        };
    },
    beforeMount() {
        this.cellValue = this.params.value ? 'tick-in-circle' : 'cross-in-circle';
    },
});
