export default {
    template: `<span class="imgSpan">
      <img v-for="images in arr" :src="src" class="priceIcon" />
      </span>`,
    data: function () {
        return {
            arr: [],
            src: 'https://www.ag-grid.com/example-assets/icons/pound-coin-color-icon.svg',
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
            let priceMultiplier = 1;

            if (params.value > 300_000_000_000) {
                priceMultiplier = 5;
            } else if (params.value > 20_000_000_000) {
                priceMultiplier = 4;
            } else if (params.value > 10_000_000_000) {
                priceMultiplier = 3;
            } else if (params.value > 5_000_000_000) {
                priceMultiplier = 2;
            }
            this.arr = new Array(priceMultiplier);
        },
    },
};
