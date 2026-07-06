export interface CustomParams {
    count: number;
}

export const CustomOverlay = {
    template: `<div class="my-custom-overlay">
        <span>Custom Overlay: {{ count }}</span>
        <span class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            Custom overlay shown. Count {{ count }}.
        </span>
    </div>`,
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
