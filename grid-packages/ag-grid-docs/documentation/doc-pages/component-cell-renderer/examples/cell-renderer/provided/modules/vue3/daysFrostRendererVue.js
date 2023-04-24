export default {
    template: `<span><img v-for="img in value" :src="rendererImage"/></span>`,
    data: function () {
        return {
            value: 0,
            rendererImage: ''
        };
    },
    beforeMount() {
        this.updateImage(this.params);
    },
    methods: {
        updateImage(params) {
            this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${params.rendererImage}`;
            this.value = params.value;
        },
        refresh(params) {
            this.updateImage(params);
        }
    }
};
