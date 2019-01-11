import Vue from "vue";

export default Vue.extend({
    template: `
        <span>
            {{this.value}}
        </span>
    `,
    data: function () {
        return {
            value: null
        };
    },
    beforeMount() {
    },
    mounted() {
        this.value = this.valueSquared();
    },
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
});