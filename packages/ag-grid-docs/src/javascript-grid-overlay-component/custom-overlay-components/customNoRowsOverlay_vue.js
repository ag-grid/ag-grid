import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="ag-overlay-loading-center" style="background-color: lightcoral; height: 9%">
                <i class="fa fa-frown-o"> {{params.noRowsMessageFunc()}}</i>
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