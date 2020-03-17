import Vue from "vue";

export default Vue.extend({
    template: `
        <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
            <i class="fas fa-spinner fa-pulse"></i> <span>{{params.loadingMessage}}</span>
        </div>
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