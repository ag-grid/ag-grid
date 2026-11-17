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
    template: `<div :ref="'wrapper'" style="overflow: hidden; text-overflow: ellipsis">{{ displayValue }}</div>`,
    data: function () {
        return {
            displayValue: '',
        };
    },
    beforeMount() {
        this.displayValue = this.params.value;
        this.params.setTooltip(`Dynamic Tooltip for ${this.params.value}`, () => {
            const wrapper = this.$refs.wrapper as HTMLElement;
            return wrapper.scrollWidth > wrapper.clientWidth;
        });
    },
});
