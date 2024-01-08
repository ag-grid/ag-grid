export default {
    template: `<span><span v-if="showPrefix">Days: </span><img v-for="img in value" :src="rendererImage"/></span>`,
    data: function () {
        return {
            value: 0,
            rendererImage: '',
            showPrefix: false
        };
    },
    beforeMount() {
        this.updateImage(this.params);
    },
    methods: {
        updateImage(params) {
            this.showPrefix = params.showPrefix;
            this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${params.rendererImage}`;
            this.value = params.value;
        },
        refresh(params) {
            this.updateImage(params);
        }
    }
};
