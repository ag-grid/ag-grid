import Vue from "vue";

export default Vue.extend({
    template: `
        <span>{{formattedValue}}</span>
    `,
    data: function () {
        return {
        };
    },
    computed: {
        formattedValue: function() {
            return this.formatValueToCurrency('EUR', this.params.value)
        }
    },
    beforeMount() {
    },
    mounted() {
    },
    methods: {
        formatValueToCurrency(currency, value) {
            return `${currency}${value}`
        },
        refresh(params) {
            if(params.value !== this.params.value) {
                this.params = params;
            }
            return true;
        }
    }
});