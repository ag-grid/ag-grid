import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { ITooltipParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ITooltipParams & { color: string }>,
            required: true,
        },
    },
    template: `
      <div class="custom-tooltip" v-bind:style="{ backgroundColor: color }">
          <div><b>Custom Tooltip</b></div>
          <div>{{ value }}</div>
      </div>
    `,
    data: function () {
        return {
            value: null as string | null,
            color: null as string | null,
            athlete: null,
            country: null,
            total: null,
        };
    },
    beforeMount() {
        this.value = this.params.value;
        this.color = this.params.color || '#999';
    },
});
