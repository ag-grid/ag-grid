import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IStatusPanelParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IStatusPanelParams>,
            required: true,
        },
    },
    template: `
      <div class="ag-status-name-value">
        <span>Row Count Component&nbsp;:</span>
        <span class="ag-status-name-value-value">{{ count }}</span>
      </div>
    `,
    data: function () {
        return {
            count: null as number | null,
        };
    },
    beforeMount() {
        this.params.api.addEventListener('rowDataUpdated', () => {
            this.count = this.params.api.getDisplayedRowCount();
        });
    },
});
