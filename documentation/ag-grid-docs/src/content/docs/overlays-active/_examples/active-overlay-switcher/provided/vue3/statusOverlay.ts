export interface StatusOverlayParams {
    myCounter?: number;
}

export const StatusOverlay = {
    template: `<div class="status-overlay">custom: {{ myCounter }}</div>`,
    data() {
        return {
            myCounter: undefined as number | undefined,
        };
    },
    beforeMount(this: any) {
        this.updateCounter(this.params as StatusOverlayParams | undefined);
    },
    methods: {
        refresh(this: any, params: StatusOverlayParams) {
            this.updateCounter(params);
            return true;
        },
        updateCounter(this: { myCounter?: number }, params?: StatusOverlayParams) {
            this.myCounter = params?.myCounter;
        },
    },
};
