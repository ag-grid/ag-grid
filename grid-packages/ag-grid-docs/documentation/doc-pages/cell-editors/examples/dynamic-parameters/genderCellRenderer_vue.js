export default {
    template: `
      <span :style="{backgroundColor: backgroundColor, padding: '5px'}">
                <img :src="imageSource">{{ value }}
            </span>
    `,
    data: function () {
        return {
            imageSource: null,
            value: '',
            backgroundColor: '',
        };
    },
    beforeMount() {
        this.image = this.params.value === 'Male' ? 'male.png' : 'female.png';
        this.imageSource = `https://www.ag-grid.com/example-assets/genders/${this.image}`;
        this.value = this.params.value;
        this.backgroundColor = this.params.value === 'Male' ? '#2244CC88' : '#CC229988';
    },
    mounted() {
    },
    methods: {}
};
