import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="ag-overlay-loading-center" style="background-color: lightcoral;">
                <i class="far fa-frown"> {{params.noRowsMessageFunc()}}</i>
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