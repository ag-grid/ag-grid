import Vue from "vue";

export default Vue.extend({
    template: `
        <span :style="params.style">{{params.value}}</span>
    `,
    data: function () {
        return {
        };
    },
    beforeMount() {
    },
    mounted() {
    },
    methods: {
    }
});