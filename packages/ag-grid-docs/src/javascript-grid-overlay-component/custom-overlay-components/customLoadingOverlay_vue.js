import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">
                <i class="fas fa-hourglass-half"> {{params.loadingMessage}} </i>
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