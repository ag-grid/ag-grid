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
        <div class="custom-color-cell-renderer" :class="{'color-pill': isPill, 'color-tag': !isPill}">
            <template v-for="(value, index) in values">
                <span
                :style="{ 'background-color': backgroundColor, 'box-shadow': boxShadow, 'border-color': value }"
                >
                    {{value}}
                </span>
            </template>
        </div>
    `,
    data() {
        return {
            isPill: false,
            values: [] as string[],
            backgroundColor: null as string | null,
            boxShadow: null as string | null,
        };
    },
    beforeMount() {
        const { value } = this.params;
        const isPill = (this.isPill = Array.isArray(value));
        this.values = (this.isPill ? value : [value]).filter((value: string) => value != null && value !== '');
        this.backgroundColor = isPill ? `color-mix(in srgb, transparent, ${value} 20%)` : null;
        this.boxShadow = isPill ? `0 0 0 1px color-mix(in srgb, transparent, ${value} 50%)` : null;
    },
});
