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
      <span>
      <i :class="iconClass"> </i> {{ value }}
    </span>
  `,
    data: function () {
        return {
            iconClass: null as string | null,
            value: '',
        };
    },
    beforeMount() {
        this.iconClass = this.params.value === 'Male' ? 'fa fa-male' : 'fa fa-female';
        this.value = this.params.value;
    },
});
