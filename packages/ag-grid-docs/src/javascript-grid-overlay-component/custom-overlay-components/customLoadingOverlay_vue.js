import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="ag-overlay-loading-center" style="background-color: lightsteelblue; height: 9%">
                <i class="fa fa-hourglass-1"> {{params.loadingMessage}} </i>
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