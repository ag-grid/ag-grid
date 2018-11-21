import Vue from "vue";

export default Vue.extend({
    template: `
        <span>Field: {{this.params.colDef.field}}, Value: {{this.params.value}}</span>
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