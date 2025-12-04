import { ref, watch } from 'vue';

import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

export interface CustomParams {
    count: number;
}

export const CustomOverlay = {
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
        refresh(params) {
            this.count = params.count;
            return true;
        },
    },
};
