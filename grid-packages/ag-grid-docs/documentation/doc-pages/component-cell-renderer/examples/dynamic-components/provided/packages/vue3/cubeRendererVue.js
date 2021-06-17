export default {
    template: `
      <span>
            {{ this.value }}
        </span>
    `,
    data: function () {
        return {
            value: null
        };
    },
    mounted() {
        this.value = this.valueCubed();
    },
    methods: {
        valueCubed() {
            return this.params.value * this.params.value * this.params.value;
        }
    }
};
