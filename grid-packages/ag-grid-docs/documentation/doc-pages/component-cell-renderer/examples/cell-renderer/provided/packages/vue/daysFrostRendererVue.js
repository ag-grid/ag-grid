export default {
    template: `<span><img v-for="img in value" :src="rendererImage"/></span>`,
    data: function () {
        return {
            value: 0,
            rendererImage: ''
        };
    },
    beforeMount() {
        this.updateImage();
    },
    methods: {
        updateImage() {
            this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${this.params.rendererImage}`;
            this.value = this.params.value;
        },
        refresh(params) {
            this.params = params;
            this.updateImage();
        }
    }
};
