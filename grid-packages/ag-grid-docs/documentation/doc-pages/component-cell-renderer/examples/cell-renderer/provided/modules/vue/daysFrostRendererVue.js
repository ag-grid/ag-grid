export default {
    template: `<span><span v-if="showPrefix">Days: </span><img v-for="img in value" :src="rendererImage"/></span>`,
    data: function () {
        return {
            value: 0,
            rendererImage: '',
            showPrefix: false,
        };
    },
    beforeMount() {
        this.updateImage();
    },
    methods: {
        updateImage() {
            this.showPrefix = this.params.showPrefix;
            this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${this.params.rendererImage}`;
            this.value = this.params.value;
        },
        refresh(params) {
            this.params = params;
            this.updateImage();
        }
    }
};
