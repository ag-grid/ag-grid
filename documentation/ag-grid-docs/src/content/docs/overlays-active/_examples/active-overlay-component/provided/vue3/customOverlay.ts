import { defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';

import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

export interface CustomParams {
    count: number;
}

export const CustomOverlay = defineComponent({
    props: {
        params: {
            type: Object as PropType<IOverlayParams & CustomParams>,
            required: true,
        },
    },
    template: `<div class="my-custom-overlay">Custom Overlay: {{ count }}</div>`,
    data: function () {
        return {
            count: 1,
        };
    },
    beforeMount() {
        this.count = this.params.count;
    },
    methods: {
        refresh(params: IOverlayParams & CustomParams): boolean {
            this.count = params.count;
            return true;
        },
    },
});
