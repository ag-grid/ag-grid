export default {
    template: `<span class="imgSpan">
      <img v-for="images in arr" :src="src" class="priceIcon" />
      </span>`,
    data: function () {
        return {
            arr: [],
            src: 'https://www.ag-grid.com/example-assets/icons/pound-coin-color-icon.svg',
            priceMultiplier: 1,
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplay(params);
        },
        updateDisplay(params) {
            if (params.value > 5_000_000_000) {
                this.priceMultiplier = 2;
            }
            if (params.value > 10_000_000_000) {
                this.priceMultiplier = 3;
            }
            if (params.value > 20_000_000_000) {
                this.priceMultiplier = 4;
            }
            if (params.value > 300_000_000_000) {
                this.priceMultiplier = 5;
            }
            this.arr = new Array(this.priceMultiplier);
        },
    },
};
