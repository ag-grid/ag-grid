import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { ICellRendererParams } from 'ag-grid-community';

interface MissionCellRendererParams extends ICellRendererParams {
    src?: (params: boolean) => string;
}

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<MissionCellRendererParams>,
            required: true,
        },
    },
    template: `
    <span class="missionSpan">
      <img
        :alt="params.value"
        :src="cellValue"
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
        if (this.params.src) {
            this.cellValue = this.params.src(this.params.value);
        } else {
            this.cellValue = `https://www.ag-grid.com/example-assets/icons/${
                this.params.value ? 'tick-in-circle' : 'cross-in-circle'
            }.png`;
        }
    },
});
